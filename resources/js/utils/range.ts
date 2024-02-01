export const range = (start: number, end?: number): number[] => {
    if (end === undefined) {
        return Array.from({
            length: start,
        }).map((_, index) => index);
    }

    return Array.from({
        length: end - start,
    })
        .map((_, index) => index)
        .map((index) => index + start);
};
