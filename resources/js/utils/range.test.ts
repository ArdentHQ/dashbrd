import { range } from "./range";

describe("range", () => {
    it("should create an array of specific length", () => {
        const array = range(5);

        expect(array).toHaveLength(5);

        expect(array[0]).toBe(0);
        expect(array[1]).toBe(1);
        expect(array[2]).toBe(2);
        expect(array[3]).toBe(3);
        expect(array[4]).toBe(4);
    });

    it("should create an array of specific length, but starting from a given value", () => {
        const array = range(5, 11);

        expect(array).toHaveLength(6);

        expect(array[0]).toBe(5);
        expect(array[1]).toBe(6);
        expect(array[2]).toBe(7);
        expect(array[3]).toBe(8);
        expect(array[4]).toBe(9);
        expect(array[5]).toBe(10);
    });
});
