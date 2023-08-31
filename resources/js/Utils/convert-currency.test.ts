import { parseEther } from "ethers/lib/utils";
import { convertCurrency, convertToFiat } from "./convert-currency";

describe("convertCurrency", () => {
    it.each([
        [18, parseEther("0"), 0, 0],
        [18, parseEther("1"), 0, 0],
        [18, parseEther("1"), 1, 1],
        [18, parseEther("2"), 1, 2],
        [18, parseEther("0"), 1, 0],
        [18, parseEther("100"), 1, 100],
        [18, parseEther("100"), 0, 0],
        [18, parseEther("100"), 5, 500],
        [18, parseEther("0.12"), 1, 0.12],
        [18, parseEther("412.55"), 1.25, 515.6875],
        [17, parseEther("1"), 1, 10],
    ])("should convert currency", (decimals, balance, price, result) => {
        expect(
            convertCurrency(
                {
                    balance: balance.toString(),
                    decimals,
                },
                price,
            ),
        ).toBe(result);
    });
});

describe("convertToFiat", () => {
    it.each([
        [parseEther("0"), 0, 18, 0],
        [parseEther("1"), 0, 18, 0],
        [parseEther("1"), 1, 18, 1],
        [parseEther("100"), 1, 18, 100],
        [parseEther("1"), 520.25, 18, 520.25],
        [parseEther("1"), 520.25, undefined, 520.25],
        [parseEther("0.55"), 75.25, 18, 41.3875],
    ])("should convert currency", (nativeAmount, price, decimals, result) => {
        expect(convertToFiat(nativeAmount.toString(), price, decimals)).toBe(result);
    });
});
