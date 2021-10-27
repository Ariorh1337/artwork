export default function PromiseOutside() {
    let resultPromise = () => {};
    let rejectPromise = () => {};

    const promise = new Promise((resolve, reject) => {
        resultPromise = resolve;
        rejectPromise = reject;
    });

    return {
        promise,
        resolve: resultPromise,
        reject: rejectPromise,
    };
}