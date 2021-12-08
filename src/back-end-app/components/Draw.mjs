export default function Draw(settings) {
    const {
        p5,
        particles,
        particlesData,
        pointer,
        width,
        height,
        exportSize,
        resolve
    } = settings;

    const lengthDraw = particlesData.map(particle => particle.length)
    const maxDraw = Math.max(...lengthDraw);

    const particlesDraw = () => {
        particles.forEach(particle => particle.draw(p5));

        p5.push();
        p5.pop();
        p5.noStroke();

        p5.loadPixels();
    };

    const particlesUpdate = (update_index) => {
        particles.forEach((particle, index) => {
            const data = particlesData[index][update_index];

            if (!data) return;

            particle.update(
                p5,
                pointer.x - exportSize / 2,
                pointer.y - exportSize / 2,
                width,
                height,
                data
            );
        });
    }

    return function() {
        p5.background(255);

        particlesDraw();

        for (let i = 1; i < maxDraw; i++) {
            particlesUpdate(i);
            particlesDraw();
        }

        resolve(true);
    }
}
