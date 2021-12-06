/**
 * This is syntactic sugar, avoiding unnecessary wrap-around.
 * @returns {{
 *      promise: Promise,
 *      resolve: Function,
 *      reject: Function
 * }} You will receive an object consisting of a Promise and Resolve, Reject functions.
 */
export default function Swear() {
    this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}
