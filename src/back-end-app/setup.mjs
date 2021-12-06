import p5 from "node-p5";

import spawnAllowed from "./components/spawnAllowed.mjs";
import spawnParticle from "./components/spawnParticle.mjs";
import draw from "./components/Draw.mjs";
import saveToPng from "./components/saveToPng.mjs";

import Swear from "./extra/Swear.mjs";

export default function setup(settings) {
    const swear = new Swear();

    function sketch(p) {
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

        const maxDraw = Math.max(...particleData.map(p => p.length));

        p.setup = () => {
            p.createCanvas(exportSize, exportSize);

            let divideIndex = 0;

            function divide(pp5, x, y, w, h, z, colors = colors1) {
                const randoms = randomData[divideIndex];
                divideIndex += 1;
            
                pp5.noStroke();
            
                if (randoms[0] < 0.5) colors = randoms[1];
            
                if (spawnAllowed(randoms[2], w, h, z)) {
                    const randomsP = particleData[particles.length];
                    const particle = spawnParticle(pp5, randoms[5], x, y, w, h, randomsP[0], scale);
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
                saveToPng(p, `out_${Number(new Date())}.png`);      
            });
        }

        p.draw = draw({
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

    return;
}
