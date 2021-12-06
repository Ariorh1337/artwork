import fs from "fs";

/**
 * @param {p5Types} p5 
 * @param {string} name 
 */
export default function saveToPng(p5, name) {
    p5.loadPixels();
    const image64 = p5.canvas.toDataURL();

    const base64Data = image64.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(name, base64Data, 'base64', function(err) {
        console.log(err);
    });
}