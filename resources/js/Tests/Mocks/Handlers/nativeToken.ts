import TokenData = App.Data.Token.TokenData;
import TokenPriceData = App.Data.Token.TokenPriceData;
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";

const currency = "USD";

const nativeToken = new TokenDataFactory().native().create({
    chainId: 137,
    symbol: "MATIC",
    name: "Matic",
    guid: 1,
    decimals: 18,
});

const nativeTokenPrice = {
    guid: 1,
    symbol: nativeToken.symbol,
    chainId: 137 as App.Enums.Chains,
    price: {
        [currency]: {
            price: 12.25,
            percentChange24h: 7.25,
        },
    },
};
export const setNativeTokenHandler = (
    token: TokenData = nativeToken,
    price: TokenPriceData = nativeTokenPrice,
): void => {
    server.use(
        requestMock(`${BASE_URL}/tokens/network-native-token`, {
            token,
            tokenPrice: price,
        }),
    );
};
