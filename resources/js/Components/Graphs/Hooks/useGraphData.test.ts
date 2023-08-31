import { offsetPercentages } from "./useGraphData.contracts";

describe("offsetPercentages", () => {
    it("should offset percentages if some are removed", () => {
        const singularAsset = [
            {
                data: {
                    label: "item 1",
                    value: 150,
                    index: 0,
                },
                formatted: "98%",
                value: 98,
            },
        ];

        expect(offsetPercentages(singularAsset)).toEqual([
            {
                data: {
                    label: "item 1",
                    value: 150,
                    index: 0,
                },
                formatted: "98%",
                value: 100,
            },
        ]);
    });

    it("should try to offset percentages even if no data", () => {
        expect(offsetPercentages([null])).toEqual([]);
    });
});
