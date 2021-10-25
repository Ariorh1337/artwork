export default function PromiseOutside() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let resultPromise = (value: unknown) => {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let rejectPromise = (value: unknown) => {};

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
