import React from "react";
import Sketch from "react-p5";
import { RiArrowGoBackLine, RiArrowGoForwardLine, RiPauseFill, RiPlayFill, RiRestartLine } from 'react-icons/ri';
import p5Types from "p5"; //Import this for typechecking and intellisense
import { colors1, colors2, Particle } from "../Particle";
import { toast } from "react-hot-toast";
import { PreviewImage } from "./PreviewImage";

interface ComponentProps {
    //Your component props
}
let canvasRef: HTMLCanvasElement;
let p5Ref: p5Types;
let prevState: p5Types.Image;
export const PlotPreview: React.FC<ComponentProps> = (props: ComponentProps) => {
    let x = 0;
    let y = 0;
    const width = 12500;
    const height = 12500;
    const sizeA = 1600;
    const particles: Particle[] = [];

    const [shouldUpdate, setShouldUpdate] = React.useState<boolean>(false)

    const
        tempCanvas = React.useRef<p5Types.Image>()

    const divide =
        (p5: p5Types, x: number, y: number, w: number, h: number, z: number, colors = colors1) => {
            p5.noStroke()
            if (p5.random() < 0.5) {
                colors = p5.random([colors1, colors2])
            }
            if ((p5.random() < (0.3 + z / 5) && w > 15 && h > 15 && z > 0) || z > 8) {
                p5.push()
                p5.translate(w / 2, height / 2)
                p5.rotate(-p5.sin(z / 10) / 10)
                p5.translate(-width / 2, -height / 2)
                let ratio = p5.random()
                if (p5.random() < 0.5) {
                    divide(p5, x, y, w * ratio, h, z - 1, colors)
                    divide(p5, x + w * ratio, y, w * (1 - ratio), h, z - 1, colors)
                } else {
                    divide(p5, x, y, w, h * ratio, z - 1, colors)
                    divide(p5, x, y + h * ratio, w, h * (1 - ratio), z - 1, colors)
                }
                p5.pop()
            } else {
                let clr = p5.random(colors)
                particles.push(new Particle(p5, {
                    p: p5.createVector(x, y),
                    v: p5.createVector(p5.sin(x / 100) / 3, p5.cos(y / 100) / 3),
                    // a: createVector(sin(x/200)/500,cos(y/200)/500),
                    size: p5.createVector(w, h),
                    color: clr
                }))
                // 		mainCanvas.fill(clr)

                // 		mainCanvas.ellipse(x,y,w,h)
            }
        }

    //See annotations in JS for more information
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef);
        canvasRef = canvasParentRef.children[0] as HTMLCanvasElement;
        p5Ref = p5;
        canvasRef.addEventListener('mousedown', e => {
            window.dispatchEvent(new Event("save_preview"));
            // if (!canvasRef) return;
            // toast.success('Displaying High Quality Preview')
            // let canvasCopy = p5.get(x * (width / canvasRef.getBoundingClientRect().width) - sizeA / 2, y * (height / canvasRef.getBoundingClientRect().height) - sizeA / 2, sizeA, sizeA);
            // canvasCopy.loadPixels()
            // const tempGraphics = p5.createGraphics(width, height)
            // tempGraphics.image(canvasCopy, 0, 0);
            // const upScale = 8;
            // tempGraphics.scale(upScale)
            // canvasCopy = tempGraphics.get(0, 0, sizeA * upScale, sizeA * upScale)
            // canvasCopy.save("myImage", "png")

        });

        canvasRef.addEventListener('mousemove', e => {
            if (!(e instanceof MouseEvent)) return;
            x = e.pageX - canvasRef.getBoundingClientRect().left;
            y = e.pageY - canvasRef.getBoundingClientRect().top;

        });
        divide(p5, 0, 0, width, height, 12)
        p5.noStroke()
    };

    const draw = (p5: p5Types) => {
        p5.background(255);
        if (prevState) p5.image(prevState, 0, 0)
        if (shouldUpdate) particles.forEach(p =>
            p.update(p5, width, height)
        )
        particles.forEach(p => p.draw(p5))
        if (canvasRef) {

            prevState = p5.get()
            tempCanvas.current = p5.get(x * (width / canvasRef.getBoundingClientRect().width) - sizeA / 2, y * (height / canvasRef.getBoundingClientRect().height) - sizeA / 2, sizeA, sizeA);
        }

        const sW = 24;
        p5.strokeWeight(sW);
        p5.stroke(42);
        p5.fill(0, 0, 0, 0)
        if (canvasRef) {
            const cursorX = x * (width / canvasRef.getBoundingClientRect().width)
            const cursorY = y * (height / canvasRef.getBoundingClientRect().height)
            p5.rect(cursorX - sizeA / 2 - sW / 2, cursorY - sizeA / 2 - sW / 2, sizeA + sW, sizeA + sW)
        }
        p5.push()
        p5.pop()
        p5.noStroke()
    };

    return (
        <div className="wrapper">
            <div className="container">
                <div className="sketch">
                    <Sketch
                        className="canvas"
                        setup={setup}
                        draw={draw}
                    />
                </div>
                <div className="controls">
                    <button className="button" onClick={() => { setShouldUpdate(!shouldUpdate) }}>
                        {shouldUpdate ? <RiPlayFill /> : <RiPauseFill />}
                    </button>
                    <button className="button" onClick={() => {
                        particles.forEach(p => {
                            p.update(p5Ref, width, height)
                        })
                    }}>
                        <RiArrowGoForwardLine />
                    </button>
                </div>
            </div>
            <PreviewImage preview={tempCanvas} />
        </div>
    )
};