import { type TooltipItem } from "chart.js";
import {
    buildGetTooltipLabel,
    buildGetTooltipTitle,
    buildGetXTickLabel,
    buildGetYTickLabel,
    determineIfTimestampGroupChanged,
} from "./TokenPriceChart.helpers";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import { DateFormat } from "@/Types/enums";

describe("TokenPriceChart.helpers", () => {
    describe("callback builders", () => {
        it("builds getYTickLabel callback", () => {
            const getYTickLabel = buildGetYTickLabel({
                t: vi.fn().mockReturnValue("test"),
                currency: "USD",
            });

            expect(getYTickLabel(100, 0, [])).toEqual("test");
        });

        it("builds getXTickLabel callback", () => {
            const getXTickLabel = buildGetXTickLabel({
                formattedTimeLabels: ["10:00", ""],
            });

            expect(getXTickLabel(100, 0, [])).toEqual("10:00");

            expect(getXTickLabel(100, 1, [])).toEqual("");
        });

        it("builds getTooltipTitle callback", () => {
            const getTooltipTitle = buildGetTooltipTitle({
                periodData: [
                    {
                        timestamp: 1678991401469,
                        price: 0.000000000000000001,
                    },
                ],
                dateFormat: DateFormat.A,
                timeFormat: "24",
                timezone: "UTC",
                period: Period.WEEK,
            });

            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const tooltipItem = {
                dataIndex: 0,
            } as TooltipItem<"line">;

            expect(getTooltipTitle([tooltipItem])).toEqual("16/03/2023 18:30");
        });

        it("builds getTooltipLabel callback", () => {
            const getTooltipLabel = buildGetTooltipLabel({
                t: vi.fn().mockReturnValue("$0,00001"),
                currency: "USD",
            });

            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const tooltipItem = {
                raw: 0.000000000000000001,
            } as TooltipItem<"line">;

            expect(getTooltipLabel(tooltipItem)).toEqual("$0,00001");
        });
    });

    describe("determineIfTimestampGroupChanged", () => {
        describe("For 24h period", () => {
            const period = Period.DAY;

            it("returns true if is the first element (index==0) and date is at the beggining at the hour", () => {
                const date = new Date("2023-04-01T00:00:00.000Z");

                const index = 0;
                const periodData = [
                    {
                        timestamp: 1678991401469,
                        price: 0.000000000000000001,
                    },
                ];

                const result = determineIfTimestampGroupChanged({
                    date,
                    periodData,
                    index,
                    period,
                });

                expect(result).toEqual(true);
            });

            it("returns false if is the first element (index==0) but date is not at the beggining at the hour", () => {
                const date = new Date("2023-04-01T00:01:00.000Z");

                const index = 0;
                const periodData = [
                    {
                        timestamp: 1678991401469,
                        price: 0.000000000000000001,
                    },
                ];

                const result = determineIfTimestampGroupChanged({
                    date,
                    periodData,
                    index,
                    period,
                });

                expect(result).toEqual(false);
            });

            it("returns true if the hour is different from the previous one", () => {
                const previousDate = new Date("2023-04-01T00:00:00.000Z");
                const date = new Date("2023-04-01T01:00:00.000Z");

                const index = 1;

                const periodData = [
                    {
                        timestamp: previousDate.getTime(),
                        price: 0.000000000000000001,
                    },
                ];

                const result = determineIfTimestampGroupChanged({
                    date,
                    periodData,
                    index,
                    period,
                });

                expect(result).toEqual(true);
            });

            it("returns false if the hour is the same from the previous one", () => {
                const previousDate = new Date("2023-04-01T01:00:00.000Z");
                const date = new Date("2023-04-01T01:12:00.000Z");

                const index = 1;

                const periodData = [
                    {
                        timestamp: previousDate.getTime(),
                        price: 0.000000000000000001,
                    },
                ];

                const result = determineIfTimestampGroupChanged({
                    date,
                    periodData,
                    index,
                    period,
                });

                expect(result).toEqual(false);
            });
        });
        describe("For reset of periods", () => {
            const period = Period.WEEK;

            it("returns true if is the first element (index==0)", () => {
                const date = new Date("2023-04-01T00:00:00.000Z");

                const index = 0;
                const periodData = [
                    {
                        timestamp: 1678991401469,
                        price: 0.000000000000000001,
                    },
                ];

                const result = determineIfTimestampGroupChanged({
                    date,
                    periodData,
                    index,
                    period,
                });

                expect(result).toEqual(true);
            });

            it("returns true if the day is different from the previous one", () => {
                const previousDate = new Date("2023-04-01T00:00:00.000Z");
                const date = new Date("2023-04-02T01:00:00.000Z");

                const index = 1;

                const periodData = [
                    {
                        timestamp: previousDate.getTime(),
                        price: 0.000000000000000001,
                    },
                ];

                const result = determineIfTimestampGroupChanged({
                    date,
                    periodData,
                    index,
                    period,
                });

                expect(result).toEqual(true);
            });

            it("returns false if the day is the same from the previous one", () => {
                const previousDate = new Date("2023-04-01T01:00:00.000Z");
                const date = new Date("2023-04-01T02:12:00.000Z");

                const index = 1;

                const periodData = [
                    {
                        timestamp: previousDate.getTime(),
                        price: 0.000000000000000001,
                    },
                ];

                const result = determineIfTimestampGroupChanged({
                    date,
                    periodData,
                    index,
                    period,
                });

                expect(result).toEqual(false);
            });
        });
    });
});
