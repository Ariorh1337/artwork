import p5Types from "p5";

interface ShapeData {
    p?: p5Types.Vector;
    v?: p5Types.Vector;
    size?: p5Types.Vector;
    color?: p5Types.Color;
}

interface ShapeScale {
    size: number;
    simulation: number;
}

interface ShapeUpdate {
    posX: number;
    posY: number;
    ang: number;
    sizeX: number;
    sizeY: number;
}

export default class Shape {
    private p5: p5Types;

    private pos: p5Types.Vector;
    private size: p5Types.Vector;

    private velocity: p5Types.Vector;
    private color: p5Types.Color;

    private curve: number;
    private angleVelocity: number;
    private shrinkRatio: number;

    private angle = 0;
    private _randoms: any[] = [];
    private scale = 1;

    constructor(p5: p5Types) {
        this.p5 = p5;

        this.pos = p5.createVector(0, 0);
        this.size = p5.createVector(0, 0);

        this.velocity = p5.createVector(0, 0);
        this.color = p5.color(255);

        const random = this.random();

        this.curve = random.curve;
        this.angleVelocity = random.angV;
        this.shrinkRatio = random.shrinkRatio;
    }

    public setData(data: ShapeData): Shape {
        if (data.p) this.pos = data.p;
        if (data.v) this.velocity = data.v;
        if (data.size) this.size = data.size;
        if (data.color) this.color = data.color;

        return this;
    }

    public setScale(scale: ShapeScale): Shape {
        this.scale = scale.size / scale.simulation;

        return this;
    }

    public draw(p5: p5Types): Shape {
        const width = this.size.x * this.scale;
        const height = this.size.y * this.scale;

        p5.push();
        p5.translate(this.pos.x * this.scale, this.pos.y * this.scale);
        p5.translate(width / 2, height / 2);
        p5.rotate(this.angle);
        p5.translate(-width / 2, -height / 2);
        p5.fill(this.color);
        p5.rect(0, 0, width, height);
        p5.pop();

        return this;
    }

    public update(p5: p5Types, width: number, height: number): ShapeUpdate {
        const randomX = p5.random();
        const randomY = p5.random();
        const randomAngle = p5.random();

        this.pos.add(this.velocity);

        this.pos.x += randomX;
        this.pos.y += randomY;

        const angle = p5.atan2(
            this.pos.x - width / 2,
            this.pos.y - height / 2
        );

        this.pos.x += p5.sin(this.pos.y / (this.curve + this.size.x * 5) + angle * 50) / 2;
        this.pos.y += p5.cos(this.pos.x / (this.curve + this.size.y * 5) + angle * 50) / 2;

        this.velocity.mult(0.99);
        this.size.mult(this.shrinkRatio);

        this.angle += this.angleVelocity + randomAngle / 50 + p5.sin(angle * 10) / 100;

        return this.save();
    }

    get randoms() {
        return this._randoms;
    }

    private random() {
        this._randoms.push({
            curve: this.p5.random(10, 30),
            angV: this.p5.random(-0.015, 0.015),
            shrinkRatio: this.p5.random(0.99, 0.995)
        });

        return this._randoms.slice(-1)[0];
    }

    private save() {
        this._randoms.push({
            posX: this.pos.x,
            posY: this.pos.y,
            ang: this.angle,
            sizeX: this.size.x,
            sizeY: this.size.y,
        });

        return this._randoms.slice(-1)[0];
    }
}