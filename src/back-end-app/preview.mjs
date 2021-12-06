import p5 from "node-p5";

import spawnAllowed from "./components/spawnAllowed.mjs";
import spawnParticle from "./components/spawnParticle.mjs";

import Swear from "./extra/Swear.mjs";

import fs from "fs";

export default function preview(settings) {
    const swear = new Swear();

    console.log(typeof settings);

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

            p.translate(-x, -y);
            divide(p, -x, -y, width, height, 12);

            p.noStroke();

            swear.promise.then(() => {
                p.loadPixels();
                const image64 = p.canvas.toDataURL();

                const base64Data = image64.replace(/^data:image\/png;base64,/, "");
                fs.writeFile(`out_${Number(new Date())}.png`, base64Data, 'base64', function(err) {
                    console.log(err);
                });         
            });

            p.noLoop();
        }

        const drawFunc = () => {
            particles.forEach(particle => particle.draw(p));

            p.push();
            p.pop();
            p.noStroke();

            p.loadPixels();
        };

        const drawLoop = (particleIndex) => {
            particles.forEach((particle, index) => {
                const data = particleData[index][particleIndex];
                if (!data) return;

                particle.update(
                    p,
                    0,
                    0,
                    width,
                    height,
                    data
                );
            });
        }

        p.draw = () => {
            p.background(255);

            drawFunc();

            for (let i = 1; i < maxDraw; i++) {
                drawLoop(i);
                drawFunc();
            }

            swear.resolve(true);
        }
    }

    console.log("Image requested: ", Number(new Date()));

    p5.createSketch(sketch);

    return;
}