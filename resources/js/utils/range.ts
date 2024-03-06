/**
 * Create a range of numbers between the two values.
 * If `end` is omitted, then the function will create a range of numbers from 0 to `start` (exluding the `start`).
 *
 * `range(5)` => [0, 1, 2, 3, 4]
 *
 * `range(4, 8)` => [4, 5, 6, 7]
 */
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
