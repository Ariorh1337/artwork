import p5 from "node-p5";

import spawnAllowed from "../../universe/spawnAllowed.mjs";
import spawnParticle from "../../universe/spawnParticle.mjs";
import { colors1 } from "../../universe/Particle.mjs";

import PromiseOutside from "../../universe/PromiseOutside.mjs";

export default function setup(settings) {
    let swear = PromiseOutside();

    function sketch(p) {
        const { multiplier, width, height, randomData, particleData, crop } = settings;

        const particles = [];

        let graphics;

        p.setup = () => {
            graphics = p.createGraphics(width * multiplier, height * multiplier);

            const canvas = p.createCanvas(width, height);

            let divideIndex = 0;

            function divide(pp5, x, y, w, h, z, colors = colors1) {
                const randoms = randomData[divideIndex];
                divideIndex += 1;
            
                pp5.noStroke();
            
                if (randoms[0] < 0.5) colors = randoms[1];
            
                if (spawnAllowed(randoms[2], w, h, z)) {
                    const particle = spawnParticle(multiplier, pp5, randoms[5], x, y, w, h);
                    particles.push(particle);
                    return;
                }
            
                pp5.push();
                pp5.translate(w / 2, (height / 2));
                pp5.rotate(-pp5.sin(z / 10) / 10);
                pp5.translate((-width / 2), (-height / 2));
            
                const ratio = randoms[3];
            
                if (randoms[4] < 0.5) {
                    divide(pp5, x, y, w * ratio, h, z - 1, colors);
                    divide(pp5, x + w * ratio, y, w * (1 - ratio), h, z - 1, colors);
                } else {
                    divide(pp5, x, y, w, h * ratio, z - 1, colors);
                    divide(pp5, x, y + h * ratio, w, h * (1 - ratio), z - 1, colors);
                }
            
                pp5.pop()
            }

            divide(graphics, 0, 0, width, height, 12);

            graphics.noStroke();

            p.noLoop();

            particleData.forEach((data, index) => {
                particles[index].curve = data[0].curve;
                particles[index].angV = data[0].angV;
                particles[index].shrinkRatio = data[0].shrinkRatio;
            });

            swear.promise.then(() => {
                p.saveCanvas(canvas, 'out', 'png').then(f => {
                    console.log("Success to get image");
                }).catch((f) => {
                    console.log(`failed to save canvas. ${f}`);
                });                
            });
        }

        p.draw = () => {
            graphics.background(255);

            particles.forEach(particle => particle.draw(graphics));

            const image = graphics.get(
                (crop.x * multiplier) - (crop.width * multiplier) / 2,
                (crop.y * multiplier) - (crop.height * multiplier) / 2,
                (crop.width * multiplier),
                (crop.height * multiplier)
            )

            p.image(image, 0, 0, width, height);

            graphics.push();
            graphics.pop();
            graphics.noStroke();

            swear.resolve(true);
        }
    }

    p5.createSketch(sketch);

    return;
}