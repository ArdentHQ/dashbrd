import { formatUnits } from "ethers/lib/utils";

export const convertCurrency = (
    {
        balance,
        decimals,
    }: {
        balance: string;
        decimals: number;
    },
    price: number,
): number => {
    // We don't need super precision since it's rounded in the UI anyway.
    const formatted = +formatUnits(balance, decimals);
    return formatted * price;
};

export const convertToFiat = (nativeAmount: string, price: number, tokenDecimals = 18): number =>
    convertCurrency(
        {
            balance: nativeAmount,
            decimals: tokenDecimals,
        },
        price,
    );
