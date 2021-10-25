import * as React from 'react';
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense
import toast from 'react-hot-toast';

interface PreviewImageProps {
  preview?: any;
}
let canvasRef: HTMLCanvasElement;
let p5Ref: p5Types;
export const PreviewImage = (props: PreviewImageProps): JSX.Element => {
  const { preview } = props;

  const width = 1600;
  const height = 1600;

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
    canvasRef = canvasParentRef.children[0] as HTMLCanvasElement;
    console.log(canvasParentRef)
    window.addEventListener("save_preview", savePreview)
    p5Ref = p5;
    p5.noStroke()
  };

  const savePreview = () => {
    if (!canvasRef) return;
    toast.success('Displaying High Quality Preview')
    let canvasCopy = p5Ref.get(0, 0, width, height);
    canvasCopy.loadPixels()
    canvasCopy.save("myImage", "png")
  }

  const draw = (p5: p5Types) => {
    if (!preview.current) return;
    p5.background(255);
    p5.image(preview.current, 0, 0)
    p5.push()
    p5.pop()
    p5.noStroke()
  }

  return (
    <div className="sketch">
      <Sketch
        className="preview"
        setup={setup}
        draw={draw}
      />
    </div>
  )
}