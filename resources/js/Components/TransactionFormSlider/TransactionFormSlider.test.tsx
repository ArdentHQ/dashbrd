import React from "react";
import { beforeEach, describe, expect } from "vitest";
import {
    ActionType,
    SendTransactionStep,
    TransactionDirection,
    type TransactionIntent,
    type TransactionIntentActions,
    TransactionState,
} from "./TransactionFormSlider.contracts";
import { TransactionFormSlider, transactionIntentReducer } from "@/Components/TransactionFormSlider";
import { TransactionSendForm } from "@/Components/TransactionFormSlider/TransactionFormSlider.blocks";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import NetworkFeesFixture from "@/Tests/Fixtures/network_fees.json";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { render, screen, userEvent } from "@/Tests/testing-library";

const asset = new TokenListItemDataFactory().create({
    symbol: "BRDY",
});

const assets: App.Data.TokenListItemData[] = [asset];

const currency = "USD";
const balance = 342;

const nativeToken = new TokenDataFactory().native().create({
    chainId: 137,
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

const defaultMetamaskConfig = getSampleMetaMaskState({
    sendTransaction: vi.fn().mockReturnValue({ errorMessage: undefined, hash: "0x9i6QhkzlFXWt6mwcAi" }),
    getTransactionReceipt: vi.fn().mockReturnValue({ errorMessage: "Failed to get receipt" }),
});

const wallet = new WalletFactory().create();

describe("TransactionFormSlider", () => {
    const properties = {
        isOpen: true,
        asset,
        assets,
        balance,
        currency,
        onClose: vi.fn(),
        wallet,
        user: new UserDataFactory().withUSDCurrency().create(),
    };

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    beforeEach(() => {
        server.use(
            requestMock("https://api.polygonscan.com/api", NetworkFeesFixture, {
                method: "get",
            }),
        );

        server.use(
            requestMock(`${BASE_URL}/tokens/network-native-token`, {
                token: nativeToken,
            }),
        );
    });

    it("should render", () => {
        render(<TransactionFormSlider {...properties} />);

        expect(screen.getByTestId("TransactionFormSlider")).toBeInTheDocument();
    });

    it("should render send tab by default", () => {
        render(<TransactionFormSlider {...properties} />);

        expect(screen.queryByTestId("TransactionFormSlider")).toBeInTheDocument();
        expect(screen.getByTestId("TransactionSendForm")).toBeInTheDocument();
    });

    it("should render send tab", () => {
        render(
            <TransactionFormSlider
                {...properties}
                direction={TransactionDirection.Send}
            />,
        );

        expect(screen.queryByTestId("TransactionFormSlider")).toBeInTheDocument();
        expect(screen.getByTestId("TransactionSendForm")).toBeInTheDocument();
    });

    it("should render receive tab", async () => {
        render(
            <TransactionFormSlider
                {...properties}
                direction={TransactionDirection.Receive}
            />,
        );

        expect(screen.queryByTestId("TransactionFormSlider")).toBeInTheDocument();
        expect(screen.getByTestId("TransactionReceiveForm")).toBeInTheDocument();
        expect(screen.queryByTestId("SliderFormActionsToolbar__save")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("TransactionFormSliderHeader__tab1"));

        expect(screen.getByTestId("TransactionSendForm")).toBeInTheDocument();
        expect(screen.getByTestId("SliderFormActionsToolbar__save")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("TransactionFormSliderHeader__tab2"));

        expect(screen.getByTestId("TransactionReceiveForm")).toBeInTheDocument();
        expect(screen.queryByTestId("SliderFormActionsToolbar__save")).not.toBeInTheDocument();
    });

    it("should close slider", async () => {
        const onCloseMock = vi.fn();
        render(
            <TransactionFormSlider
                {...properties}
                direction={TransactionDirection.Send}
                onClose={onCloseMock}
            />,
        );

        expect(screen.queryByTestId("TransactionFormSlider")).toBeInTheDocument();
        expect(screen.getByTestId("TransactionSendForm")).toBeInTheDocument();
        expect(screen.getByTestId("SliderFormActionsToolbar__save")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("SliderFormActionsToolbar__cancel"));
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("should show back button when asset is provided in receive tab", async () => {
        const { rerender } = render(<TransactionFormSlider {...properties} />);

        await userEvent.click(screen.getByTestId("TransactionFormSliderHeader__tab2"));
        expect(screen.getByTestId("TransactionFormSlider")).toBeInTheDocument();
        expect(screen.getByTestId("SliderFormActionsToolbar__cancel")).toHaveTextContent("Back");

        rerender(
            <TransactionFormSlider
                {...properties}
                asset={undefined}
            />,
        );

        await userEvent.click(screen.getByTestId("TransactionFormSliderHeader__tab2"));
        expect(screen.getByTestId("SliderFormActionsToolbar__cancel")).toHaveTextContent("Close");
    });
});

describe("TransactionSendForm", () => {
    useTransactionSliderContextSpy();

    const transactionIntent: TransactionIntent = {
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
        hash: "0xslo6zPNnu5RPEgFRxbtdiuhzs3J31ZEmvmf3SAVngu63yUoVMOLX5qAacWpMgy",
    };

    const properties = {
        step: SendTransactionStep.Initiation,
        setStep: vi.fn(),
        assets,
        balance,
        currency,
        onClose: vi.fn(),
        transactionIntent,
        dispatch: vi.fn(),
        user: new UserDataFactory().withUSDCurrency().create(),
    };

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: new UserDataFactory().withUSDCurrency().create(),
            wallet: null,
            authenticated: false,
            showAuthOverlay: true,
        });
    });

    beforeEach(() => {
        server.use(
            requestMock("https://api.polygonscan.com/api", NetworkFeesFixture, {
                method: "get",
            }),
        );

        server.use(
            requestMock(`${BASE_URL}/tokens/network-native-token`, {
                token: nativeToken,
            }),
        );
    });

    it("should render component for the given step", async () => {
        const setStepMock = vi.fn();

        const { rerender } = render(
            <TransactionSendForm
                {...properties}
                step={SendTransactionStep.Initiation}
                setStep={setStepMock}
            />,
        );

        expect(screen.getByTestId("Transaction__InitiationStep")).toBeInTheDocument();

        rerender(
            <TransactionSendForm
                {...properties}
                step={SendTransactionStep.Execution}
                setStep={setStepMock}
            />,
        );

        expect(screen.getByTestId("Transaction__ExecutionStep")).toBeInTheDocument();

        rerender(
            <TransactionSendForm
                {...properties}
                step={SendTransactionStep.Result}
                setStep={setStepMock}
            />,
        );

        expect(await screen.findByTestId("Transaction__ResultStep")).toBeInTheDocument();
    });
});

describe("transactionIntentReducer", () => {
    const initialState = {
        asset: undefined,
        amount: undefined,
        fee: undefined,
        recipient: undefined,
        nativeToken: undefined,
        nativeTokenPrice: undefined,
        state: TransactionState.Idle,
    };

    it("should handle ActionType.SetAsset correctly", () => {
        const action = {
            type: ActionType.SetAsset,
            payload: asset,
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState.asset?.symbol).toEqual("BRDY");
    });

    it("should handle ActionType.SetAmount correctly", () => {
        const action = {
            type: ActionType.SetAmount,
            payload: 100,
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState).toEqual({ ...initialState, amount: 100 });
    });

    it("should handle ActionType.SetFee correctly", () => {
        const action = {
            type: ActionType.SetFee,
            payload: {
                type: "Avg",
                maxFee: "30.012542",
                maxPriorityFee: "10.012112",
            },
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState.fee?.maxFee).toEqual("30.012542");
    });

    it("should handle ActionType.SetRecipient correctly", () => {
        const action = {
            type: ActionType.SetRecipient,
            payload: "0x123456789",
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState).toEqual({ ...initialState, recipient: "0x123456789" });
    });

    it("should handle ActionType.SetNativeToken correctly", () => {
        const action = {
            type: ActionType.SetNativeToken,
            payload: nativeToken,
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState.nativeToken?.symbol).toEqual(nativeToken.symbol);
    });

    it("should handle ActionType.SetNativeTokenPrice correctly", () => {
        const action = {
            type: ActionType.SetNativeTokenPrice,
            payload: nativeTokenPrice,
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState.nativeTokenPrice?.guid).toEqual(nativeTokenPrice.guid);
    });

    it("should handle ActionType.SetState correctly", () => {
        const action = {
            type: ActionType.SetState,
            payload: TransactionState.InProgress,
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState).toEqual({ ...initialState, state: "InProgress" });
    });

    it("should handle ActionType.SetHash correctly", () => {
        const action = {
            type: ActionType.SetHash,
            payload: "0xslo6zPNnu5RPEgFRxb",
        } satisfies TransactionIntentActions;

        const nextState = transactionIntentReducer(initialState, action);

        expect(nextState).toEqual({ ...initialState, hash: "0xslo6zPNnu5RPEgFRxb" });
    });

    it("should return the state as-is for unknown action type", () => {
        const action = {
            type: "UNKNOWN_ACTION",
            payload: "some value",
        };

        const nextState = transactionIntentReducer(initialState, action as TransactionIntentActions);

        expect(nextState).toEqual(initialState);
    });
});
