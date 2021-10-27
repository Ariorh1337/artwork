import p5 from "node-p5";

import spawnAllowed from "./components/spawnAllowed.mjs";
import spawnParticle from "./components/spawnParticle.mjs";

import PromiseOutside from "./extra/PromiseOutside.mjs";

export default function setup(settings) {
    const swear = PromiseOutside();

    function sketch(p) {
        const { 
            pointer,
            simulationSize,
            exportSize,
            randomData,
            particleData,
            colors1,
            colors2
        } = settings;

        const width = simulationSize;
        const height = simulationSize;

        const particles = [];

        const maxDraw = Math.max(...particleData.map(p => p.length));

        let prevState;

        p.setup = () => {
            const canvas = p.createCanvas(exportSize, exportSize);

            let divideIndex = 0;

            function divide(pp5, x, y, w, h, z, colors = colors1) {
                const randoms = randomData[divideIndex];
                divideIndex += 1;
            
                pp5.noStroke();
            
                if (randoms[0] < 0.5) colors = randoms[1];
            
                if (spawnAllowed(randoms[2], w, h, z)) {
                    const particle = spawnParticle(pp5, randoms[5], x, y, w, h);
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

            particleData.forEach((data, index) => {
                particles[index].curve = data[0].curve;
                particles[index].angV = data[0].angV;
                particles[index].shrinkRatio = data[0].shrinkRatio;
            });

            swear.promise.then(() => {
                p.saveCanvas(canvas, `out_${Number(new Date())}`, 'png').then(f => {
                    console.log(`Success to get image. Name: ${f} - `, Number(new Date()));
                }).catch((f) => {
                    console.log(`failed to save canvas. ${f}`);
                });                
            });

            p.noLoop();
        }

        let particleIndex = 1;
        let drawIndex = 0;
        const drawLoop = () => {
            if (drawIndex >= 18) drawIndex = 0;
            if (drawIndex !== 0) {
                drawIndex += 1;
                return p.draw();
            }

            particles.forEach((particle, index) => {
                const data = particleData[index][particleIndex];
                if (!data) return;

                particle.update(p, width, height, data);
            });

            particleIndex += 1;

            if (particleIndex > maxDraw) swear.resolve(true);
            else p.draw();
        }

        p.draw = () => {
            p.background(255);

            if (prevState) p.image(prevState, 0, 0, exportSize, exportSize);

            particles.forEach(particle => particle.draw(p));

            prevState = p.get();

            const image = p.get(0, 0, exportSize, exportSize);

            p.image(image, 0, 0, exportSize, exportSize);

            p.push();
            p.pop();
            p.noStroke();

            drawLoop();
        }
    }

    console.log("Image requested: ", Number(new Date()));

    p5.createSketch(sketch);

    return;
}