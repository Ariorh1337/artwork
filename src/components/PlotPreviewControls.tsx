import React from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense

interface ComponentProps {
    //Your component props
}

export const PlotPreview: React.FC<ComponentProps> = (props: ComponentProps) => {
    let x = 50;
    const y = 50;

    //See annotations in JS for more information
    const setup = (p5: p5Types, canvasParentRef: Element) => {
        p5.createCanvas(1000, 1000).parent(canvasParentRef);
    };

    const draw = (p5: p5Types) => {
        p5.background(0);
        p5.ellipse(x, y, 70, 70);
        x++;
    };

    return <Sketch setup={setup} draw={draw} />;
};