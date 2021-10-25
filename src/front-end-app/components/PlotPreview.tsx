//// @ts-nocheck

import React from "react";
import Sketch from "react-p5";
import { RiArrowGoForwardLine, RiSave3Line } from 'react-icons/ri';
import p5Types from "p5"; //Import this for typechecking and intellisense

import PreviewImage from "./PreviewImage";
import PromiseOutside from "../extra/PromiseOutside";

import { colors1, colors2, Particle } from "./Particle";

export default class PlotPreview extends React.Component {
    p5?: p5Types;
    pointer?: { x: number; y: number; };
    drawSize?: number;
    canvasSize?: number;
    multiplier?: number;
    particles?: Particle[];
    devideHistory?: any[];
    promises: { 
        leftCanvasLoaded: { 
            promise: Promise<unknown>;
            resolve: (value: unknown) => void;
            reject: (value: unknown) => void; 
        };
        rightCanvasLoaded: { 
            promise: Promise<unknown>;
            resolve: (value: unknown) => void;
            reject: (value: unknown) => void;
        };
    };
    previewSize?: number;
    width: any;
    height: any;
    prevState?: p5Types.Image;
    leftCanvas?: p5Types.Image;
    rightCanvas?: p5Types.Image;

    constructor(data: any) {
        super(data);

        this.promises = {
            leftCanvasLoaded: PromiseOutside(),
            rightCanvasLoaded: PromiseOutside(),
        };

        (window as any).PlotPreview = this;
    }

    setup(p5: p5Types) {
        this.p5 = p5;

        this.pointer = { x: 0, y: 0 };
        this.drawSize = 5000;
        this.canvasSize = 800;
        this.multiplier = 6;

        this.particles = [];
        this.devideHistory = [];

        this.previewSize = this.drawSize / this.multiplier;
        this.width = this.drawSize;
        this.height = this.drawSize;

        const dummyCanvas = p5.createCanvas(100, 100);
        dummyCanvas.id("dummyCanvas");
        p5.noCanvas();
        p5.resizeCanvas(this.width, this.height);

        this.promises.leftCanvasLoaded.resolve((canvasParentRef: Element) => {
            const canvasRef = canvasParentRef.children[0] as HTMLCanvasElement;

            canvasRef.addEventListener('mousedown', e => {
                this.pointer = this.pointerToPossition(canvasRef, e);
            });

            return this.drawRectangleBounds.bind(this);
        });
        this.promises.rightCanvasLoaded.resolve(() => {
            return () => {};
        });

        this.divide(p5, 0, 0, this.width!, this.height!, 12);

        p5.noStroke();
    }

    divide(p5: p5Types, x: number, y: number, w: number, h: number, z: number, colors = colors1) {
        const randoms = [
            p5.random(),
            p5.random([colors1, colors2]),
            p5.random(),
            p5.random(),
            p5.random(),
            p5.random(colors)
        ];
        this.devideHistory!.push(randoms);
    
        p5.noStroke();
    
        if (randoms[0] < 0.5) colors = randoms[1];
    
        if (this.spawnAllowed(randoms[2], w, h, z)) {
            const particle = this.spawnParticle(randoms[5], x, y, w, h);
            this.particles!.push(particle);
            return;
        }
    
        p5.push();
        p5.translate(w / 2, (this.height! / 2));
        p5.rotate(-p5.sin(z / 10) / 10);
        p5.translate((-this.width! / 2), (-this.height! / 2));
    
        const ratio = randoms[3];
    
        if (randoms[4] < 0.5) {
            this.divide(p5, x, y, w * ratio, h, z - 1, colors)
            this.divide(p5, x + w * ratio, y, w * (1 - ratio), h, z - 1, colors)
        } else {
            this.divide(p5, x, y, w, h * ratio, z - 1, colors)
            this.divide(p5, x, y + h * ratio, w, h * (1 - ratio), z - 1, colors);
        }
    
        p5.pop()
    }

    pointerToPossition(canvas: HTMLCanvasElement, event: any) {
        const rect = canvas.getBoundingClientRect();

        const canvasX = event.pageX - rect.left;
        const canvasY = event.pageY - rect.top;

        const canvasXOffset = canvasX / (rect.width / 100);
        const canvasYOffset = canvasY / (rect.height / 100);

        return {
            x: (this.drawSize! / 100) * canvasXOffset,
            y: (this.drawSize! / 100) * canvasYOffset,
        }
    }

    spawnAllowed(value: number, w: number, h: number, z: number) {
        return !((value < (0.3 + z / 5) && w > 15 && h > 15 && z > 0) || z > 8);
    }

    spawnParticle(value: p5Types.Color, x: number, y: number, w: number, h: number) {
        const p5 = this.p5!;

        return new Particle(p5, {
            p: p5.createVector(x, y),
            v: p5.createVector(p5.sin(x / 100) / 3, p5.cos(y / 100) / 3),
            size: p5.createVector(w, h),
            color: value
        });
    }

    draw(p5: p5Types) {
        p5.background(255);
        if (this.prevState) p5.image(this.prevState, 0, 0, this.width, this.height);

        this.particles!.forEach(p => p.draw(p5));

        this.prevState = p5.get();

        this.leftCanvas = p5.get( 0, 0, this.width!, this.height!);
        this.rightCanvas = p5.get(
            this.pointer!.x - (this.previewSize! / 2), 
            this.pointer!.y - (this.previewSize! / 2),
            this.previewSize!, 
            this.previewSize!
        );

        p5.push();
        p5.pop();
        p5.noStroke();
    }

    drawRectangleBounds = (p5: p5Types) => {}

    save() {
        fetch("http://localhost:5000/setup", {
            headers: {
                "Content-Type": `application/json`
            },
            method: "POST",
            body: JSON.stringify({
                multiplier: this.multiplier,
                width: this.width,
                height: this.height,
                randomData: this.devideHistory,
                particleData: this.particles!.map((data) => data.randoms),
                crop: {
                    x: this.pointer!.x,
                    y: this.pointer!.y,
                    width: this.previewSize,
                    height: this.previewSize,
                }
            })
        }).then(r => r.text())
    }

    next() {
        this.particles!.forEach(particle => {
            particle.update(this.p5!, this.width, this.height);
        });
    }

    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    <div className="sketch">
                        <Sketch className="canvas" setup={this.setup.bind(this)} draw={this.draw.bind(this)} />
                        <PreviewImage 
                            image={"leftCanvas"} 
                            input={this.promises.leftCanvasLoaded}
                            parent={this}
                        />
                    </div>
                    <div className="controls">
                        <button className="button" onClick={this.save.bind(this)}><RiSave3Line /></button>
                        <button className="button" onClick={this.next.bind(this)}><RiArrowGoForwardLine /></button>
                    </div>
                </div>
                <PreviewImage 
                    image={"rightCanvas"}
                    input={this.promises.rightCanvasLoaded}
                    parent={this}
                />
            </div>
        );
    }
}
