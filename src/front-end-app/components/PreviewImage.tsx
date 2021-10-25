import * as React from 'react';
import Sketch from "react-p5";
import p5Types from "p5";
import PromiseOutside from "../extra/PromiseOutside";

interface PreviewImageProps {
	image: string;
	input: any;
	parent: any;
}

export default class PreviewImage extends React.PureComponent<PreviewImageProps, any> {
	image: string;
	input: any;
	width?: number;
	height?: number;
	promises?: { 
		drawRectangleBounds: { 
			promise: Promise<unknown>; 
			resolve: (value: unknown) => void; 
			reject: (value: unknown) => void; 
		};
	};
	parent: any;

	constructor(data: any) {
        super(data);

		this.parent = this.props.parent;
		this.image = this.props.image;
        this.promises = {
			drawRectangleBounds: PromiseOutside()
		}
    }

	setup(p5: p5Types, canvasParentRef: Element) {
		this.width = this.parent.canvasSize;
		this.height = this.parent.canvasSize;

		p5.createCanvas(this.width!, this.height!).parent(canvasParentRef);

		p5.noStroke()

		this.props.input.promise.then((init: any) => {
			this.promises!.drawRectangleBounds.resolve(init(canvasParentRef));
		});
	}

	draw(p5: p5Types) {
		const image = this.parent[this.image];
		if (!image) return;

		const { width, height } = this;

		p5.background(255);
		p5.image(image, 0, 0, width, height);

		this.promises!.drawRectangleBounds.promise.then((drawFrame: any) => {
			drawFrame(p5);
		});

		p5.push();
		p5.pop();
		p5.noStroke();
	}

	render() {
		return (
			<div className="sketch">
				<Sketch className="preview" setup={this.setup.bind(this)} draw={this.draw.bind(this)} />
    		</div>
		);
	}
}