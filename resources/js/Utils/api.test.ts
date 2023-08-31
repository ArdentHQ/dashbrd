import { Period } from "@/Components/Tokens/Tokens.contracts";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { getLineChartPriceHistory, getPriceHistory } from "@/Utils/api";

describe("api", () => {
    describe("getPriceHistory", () => {
        const priceHistoryDataMock: App.Data.PriceHistoryData[] = [
            {
                timestamp: 1678991401469,
                price: 0.000000000000000001,
            },
            {
                timestamp: 1678991401480,
                price: 0.000000000000000001,
            },
        ];

        it("should format a timestamp with a default format", async () => {
            server.use(requestMockOnce(`${BASE_URL}/price_history`, priceHistoryDataMock, { method: "post" }));

            const result = await getPriceHistory({
                token: "bitcoin",
                currency: "USD",
                period: Period.DAY,
            });

            expect(result).toEqual(priceHistoryDataMock);
        });
    });

    describe("getLineChartPriceHistory", () => {
        const priceHistoryDataMock: Record<string, App.Data.PriceHistoryData[]> = {
            bitcoin: [
                {
                    timestamp: 1678991401469,
                    price: 0.000000000000000001,
                },
                {
                    timestamp: 1678991401480,
                    price: 0.000000000000000001,
                },
            ],
        };

        it("should format a timestamp with a default format", async () => {
            server.use(requestMockOnce(`${BASE_URL}/line_chart_data`, priceHistoryDataMock, { method: "post" }));

            const result = await getLineChartPriceHistory({
                currency: "USD",
                symbols: ["ETH"],
            });

            expect(result).toEqual(priceHistoryDataMock);
        });
    });
});
