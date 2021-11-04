//// @ts-nocheck

import React, { BaseSyntheticEvent } from "react";
import Sketch from "react-p5";
import { RiArrowGoForwardLine, RiSave3Line, RiRefreshLine } from 'react-icons/ri';
import p5Types from "p5"; //Import this for typechecking and intellisense

import PreviewImage from "./PreviewImage";

import { colorsParse, Particle } from "./Particle";

const defaults = {
    simulationSize: 10000,
    exportSize: 2000,
    colors1: "fbaf00-ffd639-ffa3af-007cbe-00af54-fff-f24",
    colors2: "000-083d77-ebebd3-f4d35e-ee964b-f95738"
}

const simulationSize = Number(window.localStorage.getItem("simulationSize")) || defaults.simulationSize;
const exportSize = Number(window.localStorage.getItem("exportSize")) || defaults.exportSize;
const colors1raw = window.localStorage.getItem("colors1") || defaults.colors1;
const colors2raw = window.localStorage.getItem("colors2") || defaults.colors2;

const colors1 = colorsParse(colors1raw);
const colors2 = colorsParse(colors2raw);

export default class PlotPreview extends React.Component {
    p5?: p5Types;
    pointer?: { x: number; y: number; };

    //
    simulationSize: number;
    exportSize: number;
    size: number;
    zoom: number;
    
    // Randoms for server
    particles?: Particle[];
    devideHistory?: any[];

    // Render
    prevState?: p5Types.Image;
    leftCanvas?: p5Types.Image;
    rightCanvas?: p5Types.Image;

    //Buttons
    nextEnabled = true;

    constructor(data: any) {
        super(data);

        this.simulationSize = simulationSize;
        this.exportSize = exportSize;
        
        // canvas preview size
        this.size = 1000;

        // zoomed draw size of left canvas
        this.zoom = this.size / (this.simulationSize / this.exportSize); 

        // default pointer
        this.pointer = { x: this.size / 2, y: this.size / 2 };

        this.particles = [];
        this.devideHistory = [];
    }

    setup(p5: p5Types) {
        this.p5 = p5;

        p5.createCanvas(this.size, this.size);
        p5.noCanvas();

        this.divide(p5, 0, 0, this.simulationSize, this.simulationSize, 12);

        p5.noStroke();

        p5.noLoop();
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
        p5.translate(w / 2, (this.size! / 2));
        p5.rotate(-p5.sin(z / 10) / 10);
        p5.translate((-this.size! / 2), (-this.size! / 2));
    
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

    draw(p5: p5Types) {
        p5.background(255);

        if (this.prevState) p5.image(this.prevState, 0, 0, this.size, this.size );

        this.particles!.forEach(p => p.draw(p5));

        this.prevState = p5.get();

        this.leftCanvas = p5.get( 0, 0, this.size, this.size );
        this.rightCanvas = p5.get(
            this.pointer!.x - this.zoom / 2,
            this.pointer!.y - this.zoom / 2,
            this.zoom,
            this.zoom
        );

        p5.push();
        p5.pop();
        p5.noStroke();
    }

    save() {
        fetch("http://localhost:5000/setup", {
            headers: {
                "Content-Type": `application/json`
            },
            method: "POST",
            body: JSON.stringify({
                pointer: {
                    x: this.pointer!.x * (this.simulationSize / this.size),
                    y: this.pointer!.y * (this.simulationSize / this.size)
                },
                simulationSize: this.simulationSize,
                exportSize: this.exportSize,
                scale: this.size / this.simulationSize,
                randomData: this.devideHistory,
                particleData: this.particles!.map((data) => data.randoms),
                colors1: colors1,
                colors2: colors2
            })
        }).then(r => r.text()).then(r => console.log(r))
    }

    next() {
        if (!this.nextEnabled) return;
        this.nextEnabled = false;

        this.particles!.forEach((particle, index) => {
            particle.update(this.p5!, this.simulationSize, this.simulationSize);
        });

        this.draw(this.p5!);
        this.nextEnabled = true;
    }

    spawnParticle(value: p5Types.Color, x: number, y: number, w: number, h: number) {
        const p5 = this.p5!;

        return new Particle(p5, {
            p: p5.createVector(x, y),
            v: p5.createVector(p5.sin(x / 100) / 3, p5.cos(y / 100) / 3),
            size: p5.createVector(w, h),
            color: value
        }, { size: this.size, simulationSize: this.simulationSize });
    }

    pointerToPossition(canvas: HTMLCanvasElement, event: any) {
        const rect = canvas.getBoundingClientRect();

        const canvasX = event.pageX - rect.left;
        const canvasY = event.pageY - rect.top;

        const canvasXOffset = canvasX / (rect.width / 100);
        const canvasYOffset = canvasY / (rect.height / 100);

        return {
            x: (this.size / 100) * canvasXOffset,
            y: (this.size / 100) * canvasYOffset,
        }
    }

    spawnAllowed(value: number, w: number, h: number, z: number) {
        return !((value < (0.3 + z / 5) && w > 15 && h > 15 && z > 0) || z > 8);
    }

    saveSettings(event: BaseSyntheticEvent) {
        const element = event.target as HTMLInputElement;

        let { value, min, max } = event.target;

        if (min && max && value) {
            element.value = String(Math.max(Number(min), Math.min(Number(max), Number(value))));
        }

        // @ts-ignore
        if (!element.value.trim()) element.value = defaults[element.id];

        window.localStorage.setItem(element.id, element.value);
    }

    render() {
        return (
        <div>
            <div className="container">
                <div className="settings">
                    <label>
                        <b>Simulation size</b>
                        <input type="number" defaultValue={simulationSize} id="simulationSize" min="100" max="200000" onChange={this.saveSettings} />
                    </label>
                    <label>
                        <b>Export size</b>
                        <input type="number" defaultValue={exportSize} id="exportSize" min="100" max="20000" onChange={(e) => {
                            this.saveSettings(e);
                            this.exportSize = Number(e.target.value);
                            this.zoom = this.size / (this.simulationSize / this.exportSize);
                            this.draw(this.p5!);
                        }} />
                    </label>
                    <label>
                        <b>Colors 1</b>
                        <input type="text" defaultValue={colors1raw} id="colors1" onChange={this.saveSettings} />
                    </label>
                    <label>
                        <b>Colors 2</b>
                        <input type="text" defaultValue={colors2raw} id="colors2" onChange={this.saveSettings} />
                    </label>
                </div>
            </div>
            <div className="wrapper">
                <div className="container">
                    <div className="sketch">
                        <Sketch className="canvas" setup={this.setup.bind(this)} draw={this.draw.bind(this)} />
                        <PreviewImage name={"leftCanvas"} parent={this} />
                    </div>
                    <div className="controls">
                        <button className="button" onClick={() => { window.location.reload() }}><RiRefreshLine /></button>
                        <button className="button" onClick={this.save.bind(this)}><RiSave3Line /></button>
                        <button className="button" onClick={this.next.bind(this)}><RiArrowGoForwardLine /></button>
                    </div>
                </div>
                <div className="container">
                    <div className="sketch">
                        <PreviewImage name={"rightCanvas"} parent={this} />
                    </div>
                </div>
            </div>
        </div>
        );
    }
}
