/**
 * @param {number} value 
 * @param {number} w 
 * @param {number} h 
 * @param {number} z 
 * @returns {boolean}
 */
export default function spawnAllowed (value, w, h, z) {
    return !((value < (0.3 + z / 5) && w > 15 && h > 15 && z > 0) || z > 8);
}