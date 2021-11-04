import p5Types from "p5";

export const colorsParse = (text: string) => {
    return text.split("-").map((a: string) => "#" + a);
};

export class Particle {
    p: p5Types.Vector;
    v: p5Types.Vector;
    size: p5Types.Vector;
    a: p5Types.Vector;
    color: p5Types.Color;
    curve: number;
    angV: number;
    ang: number;
    shrinkRatio: number;
    randoms: any[];
    scale = 0;
    real: any;

    constructor(
        p5: p5Types,
        data?: { 
            p?: p5Types.Vector,
            v?: p5Types.Vector,
            size?: p5Types.Vector,
            color: p5Types.Color
        },
        downScale?: {
            size: number,
            simulationSize: number
        }
    ) {
        this.p = data?.p ?? p5.createVector(0, 0);
        this.v = data?.v ?? p5.createVector(0, 0);
        this.size = data?.size ?? p5.createVector(0, 0);
        this.a = p5.createVector(0, 0);
        this.color = data?.color ?? p5.color(255);
        this.ang = 0;

        this.curve = p5.random(10, 30);
        this.angV = p5.random(-0.015, 0.015);
        this.shrinkRatio = p5.random(0.99, 0.995);

        this.randoms = [];
        this.randoms.push({
            curve: this.curve,
            angV: this.angV,
            shrinkRatio: this.shrinkRatio
        });

        // Down scale
        if (!downScale) return;
        this.scale = downScale!.size / downScale!.simulationSize;
        this.real = {
            sizeX: this.size.x,
            sizeY: this.size.y,
            posX: this.p.x,
            posY: this.p.y,
        };
        this.p.x *= this.scale;
        this.p.y *= this.scale;
        this.size.x *= this.scale;
        this.size.y *= this.scale;
    }

    draw(p5: p5Types) {
        p5.push()
        p5.translate(this.p.x, this.p.y)
        p5.translate(this.size.x / 2, this.size.y / 2)
        p5.rotate(this.ang)
        p5.translate(-this.size.x / 2, -this.size.y / 2)
        p5.fill(this.color)
        p5.rect(0, 0, this.size.x, this.size.y)
        p5.pop()
    }

    update(p5: p5Types, width: number, height: number) {
        const offsets = [
            p5.random(),
            p5.random(),
            p5.random()
        ];

        this.p.add(this.v);

        this.real.posX += offsets[0];
        this.real.posY += offsets[1];
        this.p.x = this.real.posX * this.scale;
        this.p.y = this.real.posY * this.scale;

        const posX = this.p.x / this.scale;
        const posY = this.p.y / this.scale;

        const ang = p5.atan2(posX - width / 2, posY - height / 2);
        
        const sizeX = this.size.x / this.scale;
        const sizeY = this.size.y / this.scale;

        this.real.posX += (p5.sin(posY / (this.curve + sizeX * 5) + ang * 50) / 2);
        this.real.posY += (p5.cos(posX / (this.curve + sizeY * 5) + ang * 50) / 2);
        this.p.x = this.real.posX * this.scale;
        this.p.y = this.real.posY * this.scale;

        this.v.add(this.a)
        this.v.mult(0.99)

        this.size.mult(this.shrinkRatio)

        this.ang += this.angV + offsets[2] / 50 + p5.sin(ang * 10) / 100;

        this.randoms.push({
            posX: this.real.posX,
            posY: this.real.posY,
            ang: this.ang,
            sizeX: this.size.x,
            sizeY: this.size.y,
        });

        return { 
            posX: this.real.posX,
            posY: this.real.posY,
            ang: this.ang,
            sizeX: this.size.x,
            sizeY: this.size.y,
        };
    }
}
