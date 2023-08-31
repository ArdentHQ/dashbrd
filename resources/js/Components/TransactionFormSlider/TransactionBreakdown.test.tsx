import { TransactionBreakdown } from "./TransactionBreakdown";
import { type TransactionIntent } from "./TransactionFormSlider.contracts";
import { TransactionState } from "@/Components/TransactionFormSlider";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("TransactionBreakdown", () => {
    const currency = "USD";
    const asset = new TokenListItemDataFactory().create({
        guid: 1,
        symbol: "BRDY",
        total_market_cap: "100000000",
        ath: "100000000",
        atl: "100000000",
        price_change_24h_in_currency: "99999",
        token_price: "99999",
        decimals: 18,
        is_native_token: true,
    });

    const nativeToken = new TokenDataFactory().native().create({
        chainId: 137,
        marketData: {
            market_cap: "100000000",
            total_volume: "100000000",
            ath: "100000000",
            atl: "100000000",
            minted_supply: "99999",
        },
        isNativeToken: true,
        isDefaultToken: true,
        decimals: 18,
        marketCap: 1,
        volume: 1000000,
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

    const transactionIntent: Required<TransactionIntent> = {
        asset,
        state: TransactionState.Idle,
        recipient: "0x1234567890123456789012345678901234567890",
        amount: 0.55,
        fee: {
            type: "Avg",
            maxFee: "30.153256",
            maxPriorityFee: "5.21252",
        },
        nativeToken,
        nativeTokenPrice,
        gasLimit: "21000",
        hash: "0x2viOxiHERRQ0eQjyxdzdNvKiaTeSm9jWVTSt8G2o9rT2YteMh35saohWCX8IBH",
    };

    const properties = {
        userCurrency: currency,
        transactionIntent,
    };
    it("shound render", () => {
        render(<TransactionBreakdown {...properties} />);

        expect(screen.getByTestId("Transaction__Breakdown")).toBeInTheDocument();
    });

    it("should display amount in user fiat", () => {
        render(<TransactionBreakdown {...properties} />);

        expect(screen.getByTestId("Transaction__AmountFiat")).toHaveTextContent(`Amount $`);
    });

    it("should display amount in native token", () => {
        render(<TransactionBreakdown {...properties} />);

        expect(screen.getByTestId("Transaction__AmountNative")).toHaveTextContent(`0.55 ${asset.symbol.toUpperCase()}`);
    });

    it("should display fiat amount", () => {
        render(<TransactionBreakdown {...properties} />);

        expect(screen.getByTestId("Transaction__GasFee")).toHaveTextContent(
            `0.0006 ${nativeToken.symbol.toUpperCase()}`,
        );
    });
});
