import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { extractTokenPriceData } from "./ExecutionStep.blocks";
import { ActionType, type TransactionIntent, TransactionState } from "@/Components/TransactionFormSlider";
import { ExecutionStep } from "@/Components/TransactionFormSlider/Steps/ExecutionStep";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { render, userEvent } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

describe("ExecutionStep", () => {
    useTransactionSliderContextSpy();

    const asset = new TokenListItemDataFactory().create({
        chain_id: 80001,
        symbol: "MATIC",
    });

    const currency = "USD";

    const nativeToken = new TokenDataFactory().create({ symbol: "MATIC", chainId: 137 });

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

    const transactionIntent: Required<Omit<TransactionIntent, "hash">> = {
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
    };

    const dispatchMock = vi.fn();
    const stepMock = vi.fn();
    const switchToNetworkMock = vi.fn();

    const defaultProperties = {
        setStep: stepMock,
        userCurrency: currency,
        transactionIntent,
        dispatch: dispatchMock,
    };

    const defaultMetamaskConfig = getSampleMetaMaskState({
        sendTransaction: vi.fn().mockReturnValue({ errorMessage: "Insufficient funds" }),
        switchToNetwork: switchToNetworkMock,
        chainId: 137 as App.Enums.Chains,
    });

    beforeEach(() => {
        stepMock.mockClear();
        dispatchMock.mockClear();
        switchToNetworkMock.mockClear();

        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    it("should try to create a transaction if state is `Idle`", async () => {
        const sendTransactionMock = vi.fn().mockReturnValue({ hash: "0xlWHLAi14yP3EL5De0C" });

        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            sendTransaction: sendTransactionMock,
        });

        render(<ExecutionStep {...defaultProperties} />);

        await waitFor(() => {
            expect(sendTransactionMock).toHaveBeenCalledOnce();
        });
    });

    it("should render a waiting message when transaction in progress", async () => {
        const intent = { ...transactionIntent, state: TransactionState.InProgress };

        const properties = {
            ...defaultProperties,
            transactionIntent: intent,
        };

        render(<ExecutionStep {...properties} />);

        expect(await screen.findByTestId("Transaction__WaitingMessage")).toBeInTheDocument();
    });

    it("should render a failed message when transaction execution fails", async () => {
        const intent = { ...transactionIntent, state: TransactionState.Failed };

        const properties = {
            ...defaultProperties,
            transactionIntent: intent,
        };

        render(<ExecutionStep {...properties} />);

        expect(await screen.findByTestId("Transaction__FailedMessage")).toBeInTheDocument();
    });

    it("should catch metamask exception and set transaction state", async () => {
        const sendTransactionMock = vi.fn().mockRejectedValue(new Error("RPC Network declined"));

        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            sendTransaction: sendTransactionMock,
        });

        render(<ExecutionStep {...defaultProperties} />);

        expect(dispatchMock).toHaveBeenNthCalledWith(1, {
            type: ActionType.SetState,
            payload: TransactionState.InProgress,
        });

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenNthCalledWith(2, {
                type: ActionType.SetState,
                payload: TransactionState.Failed,
            });
        });
    });

    it("should navigate to the next step if transaction succeeds", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            sendTransaction: vi.fn().mockReturnValue({ hash: "0xlWHLAi14yP3EL5De0C" }),
        });

        const setStepMock = vi.fn();

        const properties = { ...defaultProperties, setStep: setStepMock };
        render(<ExecutionStep {...properties} />);

        await waitFor(() => {
            expect(setStepMock).toHaveBeenCalledTimes(1);
        });
    });

    it("should navigate to the first step if cancel clicked", async () => {
        const intent = { ...transactionIntent, state: TransactionState.Failed };

        const properties = {
            ...defaultProperties,
            transactionIntent: intent,
        };

        render(<ExecutionStep {...properties} />);

        const closeButton = await screen.findByTestId("SliderFormActionsToolbar__cancel");

        await userEvent.click(closeButton);
        expect(stepMock).toHaveBeenCalled();
    });

    it("should reset transaction state to `Idle` when retry clicked", async () => {
        const intent = { ...transactionIntent, state: TransactionState.Failed };

        const properties = {
            ...defaultProperties,
            transactionIntent: intent,
        };

        render(<ExecutionStep {...properties} />);

        await userEvent.click(await screen.findByTestId("SliderFormActionsToolbar__save"));

        expect(dispatchMock).toHaveBeenCalledWith({ type: ActionType.SetState, payload: TransactionState.Idle });
    });

    it("should render fiat gas fee 0 if native token price doesn't exist for the user currency", async () => {
        const properties = { ...defaultProperties, userCurrency: "EUR" };

        render(<ExecutionStep {...properties} />);

        const gasFeeElement = await screen.findByTestId("Transaction__FiatGasFee");
        expect(gasFeeElement.textContent).toMatch(/Fee €0.00/);
    });

    it("should render network icon based on chain ID", async () => {
        const { rerender } = render(<ExecutionStep {...defaultProperties} />);

        expect(await screen.findByTestId("Polygon")).toBeInTheDocument();

        const ethNativeToken = new TokenDataFactory().create({ symbol: "ETH", chainId: 1 });

        const withEthNativeToken = {
            ...defaultProperties,
            transactionIntent: {
                ...transactionIntent,
                nativeToken: ethNativeToken,
                nativeTokenPrice: {
                    guid: 2,
                    symbol: ethNativeToken.symbol,
                    chainId: 1 as App.Enums.Chains,
                    price: {
                        [currency]: {
                            price: 12.25,
                            percentChange24h: 7.25,
                        },
                    },
                },
            },
        };

        rerender(<ExecutionStep {...withEthNativeToken} />);

        expect(screen.getByTestId("Ethereum")).toBeInTheDocument();
    });

    it("should switch to the native token's chain if the current chain is different", () => {
        const ethNativeToken = new TokenDataFactory().create({ symbol: "ETH", chainId: 1 });

        const withEthNativeToken = {
            ...defaultProperties,
            transactionIntent: {
                ...transactionIntent,
                nativeToken: ethNativeToken,
                nativeTokenPrice: {
                    guid: 2,
                    symbol: ethNativeToken.symbol,
                    chainId: 1 as App.Enums.Chains,
                    price: {
                        [currency]: {
                            price: 12.25,
                            percentChange24h: 7.25,
                        },
                    },
                },
            },
        };

        render(<ExecutionStep {...withEthNativeToken} />);

        expect(switchToNetworkMock).toHaveBeenCalledWith(1);
    });

    it("should show gas fee and base amount separately if the given token isn't native", async () => {
        const intent = { ...transactionIntent, nativeToken: new TokenDataFactory().create({ symbol: "BNB" }) };

        const properties = {
            ...defaultProperties,
            transactionIntent: intent,
        };

        render(<ExecutionStep {...properties} />);

        expect(await screen.findByTestId("Transaction__BaseAndGasAmount")).toBeInTheDocument();
    });

    it("should show total amount in the same currency if the token is same with the native token", async () => {
        render(<ExecutionStep {...defaultProperties} />);

        expect(await screen.findByTestId("Transaction__TotalAmount")).toBeInTheDocument();
    });

    it.each([Breakpoint.xs, Breakpoint.md])("should truncate address in %s screen", async (breakpoint) => {
        render(<ExecutionStep {...defaultProperties} />, { breakpoint });

        const addressElements = await screen.findAllByTestId("Transaction__Address");

        const length = breakpoint === Breakpoint.xs ? 17 : 21;
        expect(addressElements[1].textContent).toHaveLength(length);
    });
});

describe("extractTokenPriceData", () => {
    it("returns guid + currency data", () => {
        const tokenPrices: App.Data.Token.TokenPriceLookupData = {
            "1": {
                USD: {
                    price: 1,
                    percentChange24h: 1,
                },
            },
        };

        expect(extractTokenPriceData(tokenPrices, "USD", 1)).toEqual({
            price: 1,
            percentChange24h: 1,
        });
    });
    it("returns 0 if no guid", () => {
        const tokenPrices: App.Data.Token.TokenPriceLookupData = {
            "1": {
                USD: {
                    price: 1,
                    percentChange24h: 1,
                },
            },
        };

        expect(extractTokenPriceData(tokenPrices, "USD", null)).toEqual({
            price: 0,
            percentChange24h: 0,
        });
    });

    it("returns 0 if guid not in price list", () => {
        const tokenPrices: App.Data.Token.TokenPriceLookupData = {
            "1": {
                USD: {
                    price: 1,
                    percentChange24h: 1,
                },
            },
        };

        expect(extractTokenPriceData(tokenPrices, "USD", 2)).toEqual({
            price: 0,
            percentChange24h: 0,
        });
    });
    it("returns 0 if currency not in price list", () => {
        const tokenPrices: App.Data.Token.TokenPriceLookupData = {
            "1": {
                USD: {
                    price: 1,
                    percentChange24h: 1,
                },
            },
        };

        expect(extractTokenPriceData(tokenPrices, "EUR", 1)).toEqual({
            price: 0,
            percentChange24h: 0,
        });
    });
});
