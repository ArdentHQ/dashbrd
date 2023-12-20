import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render, screen } from "@/Tests/testing-library";
import { FormatCrypto, FormatFiat, FormatFiatShort, FormatNumber } from "@/Utils/Currency";

const createUserWithCurrency = (currency: string): App.Data.UserData =>
    new UserDataFactory().create({
        attributes: {
            currency,
            date_format: "MM/DD/YYYY",
            time_format: "12",
            timezone: "America/New_York",
        },
    });

describe("Currency helpers", () => {
    describe("FormatCrypto", () => {
        it.each([
            [
                {
                    symbol: "BTC",
                    decimals: 8,
                },
                "0.0012 BTC",
            ],
            [
                {
                    symbol: "ETH",
                    decimals: 5,
                },
                "1.2346 ETH",
            ],
            [
                {
                    symbol: "MATIC",
                    decimals: 2,
                },
                "1,234.56 MATIC",
            ],
        ])("should render a crypto value", (token, formatted) => {
            const restOfTokenData = {
                address: "0x000",
                network: {
                    name: "Polygon Mainnet",
                    chainId: 137,
                    isMainnet: true,
                    publicRpcProvider: "https://rpc-mainnet.maticvigil.com",
                    explorerUrl: "https://polygonscan.com",
                },
                isNativeToken: true,
                isDefaultToken: true,
                name: "Irrelevant",
                images: {
                    thumb: null,
                    small: null,
                    large: null,
                },
                marketCap: null,
                volume: null,
            };

            render(
                <span>
                    <FormatCrypto
                        value="123456"
                        token={{ ...token, ...restOfTokenData }}
                    />
                </span>,
            );

            expect(screen.getByText(formatted)).toBeTruthy();
        });

        it("should format a number with decimal places", () => {
            render(
                <span>
                    <FormatCrypto
                        value="123456.1235"
                        token={{ symbol: "ETH", decimals: 18, name: "Ethereum" }}
                    />
                </span>,
            );

            expect(screen.getByText("123,456.1235 ETH")).toBeTruthy();
        });

        it("should display as many decimals as in maximumFractionDigits", () => {
            render(
                <span>
                    <FormatCrypto
                        value="123456.1235"
                        token={{ symbol: "ETH", decimals: 18, name: "Ethereum" }}
                        maximumFractionDigits={2}
                    />
                </span>,
            );

            expect(screen.getByText("123,456.12 ETH")).toBeTruthy();
        });
    });

    describe("FormatNumber", () => {
        it("should render a number value", () => {
            render(
                <span>
                    <FormatNumber value="123456" />
                </span>,
            );

            expect(screen.getByText("123,456")).toBeTruthy();
        });
    });

    describe("FormatFiat", () => {
        const baseParameters = {
            user: undefined,
            value: "12345678",
            currency: "USD",
        };

        it.each([
            ["USD", "$12,345,678.00"],
            ["EUR", "€12,345,678.00"],
            ["MXN", "MX$12,345,678.00"],
            ["BTC", "BTC 12,345,678.00"],
        ])("formats the number with different currencies", (currency, formatted) => {
            render(
                <span>
                    <FormatFiat
                        {...baseParameters}
                        currency={currency}
                    />
                </span>,
            );

            expect(screen.getByText(formatted)).toBeTruthy();
        });

        it.each([
            ["USD", "$12,345,678.00"],
            ["EUR", "€12,345,678.00"],
            ["MXN", "MX$12,345,678.00"],
            ["BTC", "BTC 12,345,678.00"],
        ])("formats the number with different user currencies", (currency, formatted) => {
            render(
                <span>
                    <FormatFiat
                        {...baseParameters}
                        currency={undefined}
                        user={createUserWithCurrency(currency)}
                    />
                </span>,
            );

            expect(screen.getByText(formatted)).toBeTruthy();
        });

        it("uses USD as fallback if user has no currency and currency not set", () => {
            render(
                <span>
                    <FormatFiat
                        {...baseParameters}
                        currency={undefined}
                        user={undefined}
                    />
                </span>,
            );

            expect(screen.getByText("$12,345,678.00")).toBeTruthy();
        });
    });

    describe("FormatFiatShort", () => {
        it("adds a `B` suffix when the value is greater than 1 billion", () => {
            render(
                <span>
                    <FormatFiatShort
                        value="1234567890"
                        currency="USD"
                    />
                </span>,
            );

            expect(screen.getByText("$1.2B")).toBeTruthy();
        });

        it("adds a `M` suffix when the value is greater than 1 million", () => {
            render(
                <span>
                    <FormatFiatShort
                        value="12345678"
                        currency="USD"
                    />
                </span>,
            );

            expect(screen.getByText("$12.3M")).toBeTruthy();
        });

        it("adds a `K` suffix when the value is greater than 1 thousand", () => {
            render(
                <span>
                    <FormatFiatShort
                        value="12345"
                        currency="USD"
                    />
                </span>,
            );

            expect(screen.getByText("$12.3K")).toBeTruthy();
        });

        it("doesn't add a suffix when the value is less than 1 thousand", () => {
            render(
                <span>
                    <FormatFiatShort
                        value="123"
                        currency="USD"
                    />
                </span>,
            );

            expect(screen.getByText("$123")).toBeTruthy();
        });

        it.each([
            ["USD", "$12.3M"],
            ["EUR", "€12.3M"],
            ["MXN", "MX$12.3M"],
            ["BTC", "BTC 12.3M"],
        ])("formats the number with different currencies", (currency, formatted) => {
            render(
                <span>
                    <FormatFiatShort
                        value="12345678"
                        currency={currency}
                    />
                </span>,
            );

            expect(screen.getByText(formatted)).toBeTruthy();
        });
        it.each([
            ["USD", "$12.3M"],
            ["EUR", "€12.3M"],
            ["MXN", "MX$12.3M"],
            ["BTC", "BTC 12.3M"],
        ])("formats the number with different user currencies", (currency, formatted) => {
            render(
                <span>
                    <FormatFiatShort
                        value="12345678"
                        user={createUserWithCurrency(currency)}
                    />
                </span>,
            );

            expect(screen.getByText(formatted)).toBeTruthy();
        });
    });
});
