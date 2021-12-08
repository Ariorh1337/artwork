import p5 from "node-p5";

import spawnAllowed from "./components/spawnAllowed.mjs";
import Particle from "./components/Particle.mjs";
import Draw from "./components/Draw.mjs";

import Swear from "./extra/Swear.mjs";

export default function preview(settings) {
    const swearResult = new Swear();
    const swear = new Swear();

    const sketch = function(p) {
        const { 
            pointer,
            simulationSize,
            exportSize,
            randomData,
            particleData,
            colors1,
            colors2,
            scale
        } = settings;

        const width = simulationSize;
        const height = simulationSize;

        const particles = [];

        p.setup = () => {
            p.createCanvas(exportSize, exportSize);

            let divideIndex = 0;

            function divide(pp5, x, y, w, h, z, colors = colors1) {
                const randoms = randomData[divideIndex];
                divideIndex += 1;
            
                pp5.noStroke();
            
                if (randoms[0] < 0.5) colors = randoms[1];
            
                if (spawnAllowed(randoms[2], w, h, z)) {
                    const lastParticle = particles.length;
                    const randomsParticle = particleData[lastParticle];

                    const particle = new Particle(pp5, {
                        p: pp5.createVector(x, y),
                        v: pp5.createVector(pp5.sin(x / 100) / 3, pp5.cos(y / 100) / 3),
                        size: pp5.createVector(w, h),
                        color: randoms[5]
                    }, randomsParticle[0], scale);

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

            const x = pointer.x - exportSize / 2;
            const y = pointer.y - exportSize / 2;

            divide(p, -x, -y, width, height, 12);

            p.noStroke();
            p.noLoop();

            swear.promise.then(() => {
                p.loadPixels();

                const image64 = p.canvas.toDataURL();
                const base64Data = image64.replace(/^data:image\/png;base64,/, "");

                swearResult.resolve(base64Data);    
            });
        }

        p.draw = Draw({
            p5: p,
            particles,
            particlesData: particleData,
            pointer,
            width,
            height,
            exportSize,
            resolve: swear.resolve,
        });
    }

    console.log("Image requested: ", Number(new Date()));

    p5.createSketch(sketch);

    return swearResult.promise;
}
