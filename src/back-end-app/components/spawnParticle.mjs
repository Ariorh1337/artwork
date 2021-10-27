import { Particle } from "./Particle.mjs";

/**
 * Be sure you have p5 in context!
 * @param {p5Types.Color} value 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h
 * @returns {Particle}
 */
export default function spawnParticle(multiplier, p5, value, x, y, w, h) {
    x *= multiplier;
    y *= multiplier;
    w *= multiplier;
    h *= multiplier;

    return new Particle(p5, {
        p: p5.createVector(x, y),
        v: p5.createVector(p5.sin(x / 100) / 3, p5.cos(y / 100) / 3),
        size: p5.createVector(w, h),
        color: value
    });
}