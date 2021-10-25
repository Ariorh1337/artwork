export const colors1 = "fbaf00-ffd639-ffa3af-007cbe-00af54-fff-f24".split("-").map(a => "#" + a)
export const colors2 = "000-083d77-ebebd3-f4d35e-ee964b-f95738".split("-").map(a => "#" + a)

export class Particle {
    /**
     * 
     * @param {p5Types} p5 
     * @param {?Object} data 
     * @param {?p5Types.Vector} data.p
     * @param {?p5Types.Vector} data.v
     * @param {?p5Types.Vector} data.size
     * @param {?p5Types.Color} data.color
     */
    constructor(p5, data) {
        this.p = data?.p ?? p5.createVector(0, 0);
        this.v = data?.v ?? p5.createVector(0, 0);
        this.size = data?.size ?? p5.createVector(0, 0);
        this.a = p5.createVector(0, 0);
        this.color = data?.color ?? p5.color(255);
        this.curve = p5.random(10, 30);
        this.angV = p5.random(-0.015, 0.015);
        this.ang = 0;
        this.shrinkRatio = p5.random(0.99, 0.995);
    }

    draw(p5) {
        p5.push()
        p5.translate(this.p.x, this.p.y)
        p5.translate(this.size.x / 2, this.size.y / 2)
        p5.rotate(this.ang)
        p5.translate(-this.size.x / 2, -this.size.y / 2)
        p5.fill(this.color)
        p5.rect(0, 0, this.size.x, this.size.y)
        p5.pop()
    }

    update(p5, width, height) {
        this.p.add(this.v)
        this.p.x += p5.random()
        this.p.y += p5.random()
        let ang = p5.atan2(this.p.x - width / 2, this.p.y - height / 2)

        this.p.x += p5.sin(this.p.y / (this.curve + this.size.x * 5) + ang * 50) / 2

        this.p.y += p5.cos(this.p.x / (this.curve + this.size.y * 5) + ang * 50) / 2
        this.v.add(this.a)
        this.v.mult(0.99)
        this.size.mult(this.shrinkRatio)
        this.ang += this.angV + p5.random() / 50 + p5.sin(ang * 10) / 100
    }
}
