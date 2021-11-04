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
    constructor(p5, data, randoms, downScale = null) {
        this.p = data?.p ?? p5.createVector(0, 0);
        this.v = data?.v ?? p5.createVector(0, 0);
        this.size = data?.size ?? p5.createVector(0, 0);
        this.a = p5.createVector(0, 0);
        this.color = data?.color ?? p5.color(255);
        this.curve = randoms.curve;
        this.angV = randoms.angV;
        this.ang = 0;
        this.shrinkRatio = randoms.shrinkRatio;

        // Down scale
        if (!downScale) return;
        this.downScale = downScale;
        //this.p.x *= downScale;
        //this.p.y *= downScale;
        //this.size.x *= downScale;
        //this.size.y *= downScale;
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

    update(p5, x, y, width, height, data) {
        this.p.add(this.v)

        this.p.x = -x + data.posX;
        this.p.y = -y + data.posY;

        this.v.add(this.a)
        this.v.mult(0.99)

        this.size.mult(this.shrinkRatio);

        this.ang = data.ang;

        return { 
            posX: this.p.x,
            posY: this.p.y,
            ang: this.ang,
            sizeX: this.size.x,
            sizeY: this.size.y,
        };
    }
}
