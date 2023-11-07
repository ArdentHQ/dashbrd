/* eslint-disable sonarjs/cognitive-complexity */
import { expect } from "vitest";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import { DateFormat } from "@/Types/enums";
import { formatTimestamp, formatTimestampForPeriod, getTimestampParts, toHuman, toMonthYear } from "@/Utils/dates";

// Thu Mar 16 2023 12:30:01 GMT-0600 (Central Standard Time)
const timestamp = 1678991401469;

const dateFormats = Object.values(DateFormat);
const timeFormats: Array<"12" | "24"> = ["12", "24"];

describe("dates", () => {
    describe("getTimestampParts", () => {
        it("should split a timestamp into its components", () => {
            expect(
                getTimestampParts({
                    timestamp,
                    timezone: "UTC",
                }),
            ).toStrictEqual({
                day: "16",
                month: "3",
                year: "2023",
            });
        });

        it("should split a timestamp into its parts with custom options", () => {
            expect(
                getTimestampParts({
                    timestamp,
                    timezone: "UTC",
                    options: {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    },
                }),
            ).toStrictEqual({
                day: "16",
                hour: "18",
                minute: "30",
                month: "03",
                year: "2023",
            });
        });

        it("should split a timestamp into its parts with custom timezone", () => {
            expect(
                getTimestampParts({
                    timestamp,
                    timezone: "America/Mexico_City",
                    options: {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    },
                }),
            ).toStrictEqual({
                day: "16",
                hour: "12",
                minute: "30",
                month: "03",
                year: "2023",
            });
        });
    });

    describe("formatTimestampForPeriod", () => {
        it.each(dateFormats)("should format a timestamp for a DAY period with dateFormat '%s'", (dateFormat) => {
            const result = formatTimestampForPeriod({
                timestamp,
                timezone: "UTC",
                dateFormat,
                timeFormat: "24",
                period: Period.DAY,
            });

            if (dateFormat === DateFormat.A) {
                expect(result).toBe("18:30");
            }

            if (dateFormat === DateFormat.B) {
                expect(result).toBe("18:30");
            }

            if (dateFormat === DateFormat.C) {
                expect(result).toBe("18:30");
            }

            if (dateFormat === DateFormat.D) {
                expect(result).toBe("18:30");
            }
        });

        it.each(dateFormats)(`should format a timestamp for a WEEK period`, (dateFormat) => {
            const result = formatTimestampForPeriod({
                timestamp,
                timezone: "UTC",
                dateFormat,
                timeFormat: "24",
                period: Period.WEEK,
            });

            if (dateFormat === DateFormat.A) {
                expect(result).toBe("16/03/2023 18:30");
            }

            if (dateFormat === DateFormat.B) {
                expect(result).toBe("03/16/2023 18:30");
            }

            if (dateFormat === DateFormat.C) {
                expect(result).toBe("16 Mar 2023 18:30");
            }

            if (dateFormat === DateFormat.D) {
                expect(result).toBe("Mar 16, 2023 18:30");
            }
        });

        it.each(dateFormats)(`should format a timestamp for a MONTH period`, (dateFormat) => {
            const result = formatTimestampForPeriod({
                timestamp,
                timezone: "UTC",
                dateFormat,
                timeFormat: "24",
                period: Period.MONTH,
            });

            if (dateFormat === DateFormat.A) {
                expect(result).toBe("16/03/2023");
            }

            if (dateFormat === DateFormat.B) {
                expect(result).toBe("03/16/2023");
            }

            if (dateFormat === DateFormat.C) {
                expect(result).toBe("16 Mar 2023");
            }

            if (dateFormat === DateFormat.D) {
                expect(result).toBe("Mar 16, 2023");
            }
        });

        it.each(dateFormats)(`should format a timestamp for a YEAR period`, (dateFormat) => {
            const result = formatTimestampForPeriod({
                timestamp,
                timezone: "UTC",
                dateFormat,
                timeFormat: "24",
                period: Period.YEAR,
            });

            if (dateFormat === DateFormat.A) {
                expect(result).toBe("16/03/2023");
            }

            if (dateFormat === DateFormat.B) {
                expect(result).toBe("03/16/2023");
            }

            if (dateFormat === DateFormat.C) {
                expect(result).toBe("16 Mar 2023");
            }

            if (dateFormat === DateFormat.D) {
                expect(result).toBe("Mar 16, 2023");
            }
        });

        it.each(timeFormats)("should format a timestamp for a DAY period with timeFormat '%s'", (timeFormat) => {
            const result = formatTimestampForPeriod({
                timestamp,
                timezone: "UTC",
                dateFormat: DateFormat.A,
                timeFormat,
                period: Period.DAY,
            });

            if (timeFormat === "12") {
                expect(result).toBe("06:30 PM");
            }

            if (timeFormat === "24") {
                expect(result).toBe("18:30");
            }
        });

        it.each(timeFormats)("should format a timestamp for a WEEK period with timeFormat '%s'", (timeFormat) => {
            const result = formatTimestampForPeriod({
                timestamp,
                timezone: "UTC",
                dateFormat: DateFormat.A,
                timeFormat,
                period: Period.WEEK,
            });

            if (timeFormat === "12") {
                expect(result).toBe("16/03/2023 06:30 PM");
            }

            if (timeFormat === "24") {
                expect(result).toBe("16/03/2023 18:30");
            }
        });

        it("should format a timestamp for a day period in a different timezone", () => {
            expect(
                formatTimestampForPeriod({
                    timestamp,
                    timezone: "America/Mexico_City",
                    dateFormat: DateFormat.A,
                    timeFormat: "24",
                    period: Period.DAY,
                }),
            ).toBe("12:30");
        });

        it("should format a timestamp in short format", () => {
            const result = formatTimestampForPeriod({
                timestamp,
                timezone: "UTC",
                dateFormat: DateFormat.A,
                timeFormat: "24",
                period: Period.WEEK,
                short: true,
            });

            expect(result).toBe("16/03");
        });
    });

    describe("toHuman", () => {
        it("should return date in selected format", () => {
            const result = toHuman(1677628800000, { time_format: "12", date_format: "M d, Y", timezone: "UTC" });

            expect(result).toBe("Mar 01, 2023, 12:00 AM");
        });

        it("should return date in 24h format", () => {
            const result = toHuman(1677628800000, { time_format: "24", date_format: "M d, Y", timezone: "UTC" });

            expect(result).toBe("Mar 01, 2023, 24:00");
        });
    });

    describe("toMonthYear", () => {
        it("should return date in month year format", () => {
            const result = toMonthYear(1677628800000, { timezone: "UTC" });

            expect(result).toBe("Mar 2023");
        });
    });

    describe("formatTimestamp", () => {
        it("should format timestamp in the given format", () => {
            const result = formatTimestamp(1677628800000, DateFormat.A, "UTC");
            expect(result).toBe("01/03/2023");
        });

        it("should format timestamp in the pre-defined format", () => {
            const result = formatTimestamp(1677628800000);
            expect(result).toBe("01 Mar 2023");
        });
    });
});
