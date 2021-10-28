import * as React from 'react';
import Sketch from "react-p5";
import p5Types from "p5";

interface PreviewImageProps {
	name: string;
	parent: any;
}

export default class PreviewImage extends React.PureComponent<PreviewImageProps, any> {
	name: string;
	parent: any;
	width: number;
	height: number;

	constructor(data: any) {
        super(data);

		this.name = this.props.name;
		this.parent = this.props.parent;
		this.width = this.parent.size;
		this.height = this.parent.size;
    }

	setup(p5: p5Types, canvasParentRef: Element) {
		const canvas = p5.createCanvas( this.width, this.height)
			.parent(canvasParentRef);
		
		canvas.id(this.name);

		if (this.name === "leftCanvas") {
			const canvasHTML = document.getElementById("leftCanvas") as HTMLCanvasElement;
			canvasHTML.addEventListener("click", (e: any) => {
				this.parent.pointer = this.parent.pointerToPossition(canvasHTML, e);
				//@TODO сделать заимствование более явным
				this.parent.rightCanvas = this.parent.p5.get(
					this.parent.pointer!.x - this.parent.zoom / 2,
					this.parent.pointer!.y - this.parent.zoom / 2,
					this.parent.zoom,
					this.parent.zoom
				);
			});
		}

		p5.noStroke()
	}

	draw(p5: p5Types) {
		const image = this.parent[this.name];

		p5.background(255);

		if (!image) return;

		const { width, height } = this;		

		p5.image(image, 0, 0, width, height);

		if (this.name === "leftCanvas") this.drawRectangle(p5);

		p5.push();
		p5.pop();
		p5.noStroke();
	}

	render() {
		return (
			<Sketch className="preview" setup={this.setup.bind(this)} draw={this.draw.bind(this)} />
		);
	}

	drawRectangle(p5: p5Types) {
		const { x, y } = this.parent.pointer;
        p5.strokeWeight(5);
        p5.stroke(93);
        p5.fill(0, 0, 0, 0)
		p5.rect(
			x - this.parent.zoom / 2,
			y - this.parent.zoom / 2,
			this.parent.zoom,
			this.parent.zoom,
		)
	}
}