import { afterEach, beforeEach, type Mock, type SpyInstance } from "vitest";
// eslint-disable-next-line import/no-namespace
import * as useTransactionSliderContext from "@/Contexts/TransactionSliderContext";
import { type TransactionSliderState } from "@/Contexts/TransactionSliderContext";

export const initialState = {
    transactionAsset: undefined,
    lastTransaction: undefined,
    transactionSliderDirection: undefined,
    registerTransaction: vi.fn(),
    setTransactionAsset: vi.fn(),
    setTransactionSliderDirection: vi.fn(),
};

export const useTransactionSliderContextSpy = (stateOverrides?: TransactionSliderState): TransactionSliderState => {
    let spy: SpyInstance;

    const state = {
        ...initialState,
        ...stateOverrides,
    };

    const mocks = [state.setTransactionAsset, state.registerTransaction, state.setTransactionSliderDirection] as Mock[];

    beforeEach(() => {
        spy = vi.spyOn(useTransactionSliderContext, "useTransactionSliderContext").mockReturnValue(state);
    });

    afterEach(() => {
        spy.mockRestore();

        for (const mock of mocks) {
            mock.mockClear();
        }
    });

    return state;
};
