import { act, type queries, render, screen, within } from "@testing-library/react";
import { beforeEach, expect } from "vitest";
import TokenListItemData = App.Data.TokenListItemData;
import {
    ActionType,
    SendTransactionStep,
    type TransactionIntent,
    TransactionState,
} from "@/Components/TransactionFormSlider";
import { InitiationStep } from "@/Components/TransactionFormSlider/Steps/InitiationStep";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as ToastsHook from "@/Hooks/useToasts";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import NetworkFeesFixture from "@/Tests/Fixtures/network_fees.json";
import { BASE_URL, requestMock, requestMockOnce, server } from "@/Tests/Mocks/server";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { fireEvent, userEvent, waitFor } from "@/Tests/testing-library";

const nativeToken = new TokenDataFactory().native().create({
    chainId: 137,
});

const getTokenDropdownElements = async (): Promise<{
    selectElement: ReturnType<typeof within<typeof queries>>;
    searchInput: HTMLElement;
}> => {
    const selectElement = within(screen.getByTestId("TransactionSendForm_Token_Amount_Select"));
    await userEvent.click(selectElement.getByTestId("Listbox__trigger"));

    const searchInput = selectElement.getByTestId("InitiationToken__SearchInput");

    return { selectElement, searchInput };
};

describe("InitiationStep", () => {
    const asset = new TokenListItemDataFactory().create({
        name: "BRDY TOKEN",
        symbol: "BRDY",
        decimals: 18,
        balance: (123 * 1e18).toString(),
        percentage: "1",
        fiat_balance: "321",
        token_price: "10",
    });

    const secondAsset = new TokenListItemDataFactory().create({
        name: "BRDY TOKEN",
        symbol: "ABC",
        decimals: 18,
        balance: "0",
        percentage: "1",
        fiat_balance: "321",
        token_price: "10",
        is_native_token: false,
    });

    const thirdAsset = new TokenListItemDataFactory().create({
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        balance: (123 * 1e18).toString(),
        percentage: "1",
        fiat_balance: "321",
        token_price: "10",
        is_native_token: true,
    });

    const assets: App.Data.TokenListItemData[] = [asset];

    const currency = "USD";
    const balance = 342;

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
    };

    const dispatchMock = vi.fn();

    const properties = {
        step: SendTransactionStep.Initiation,
        setStep: vi.fn(),
        assets,
        balance,
        currency,
        onClose: vi.fn(),
        transactionIntent,
        dispatch: dispatchMock,
    };

    const defaultMetamaskConfig = getSampleMetaMaskState({
        sendTransaction: vi.fn().mockReturnValue({ errorMessage: undefined, hash: "0xE7QmIXrTvdZ0Y9WRsN" }),
    });

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    beforeEach(() => {
        dispatchMock.mockClear();

        server.use(
            requestMock(`${BASE_URL}/tokens/network-native-token`, {
                token: nativeToken,
                tokenPrice: nativeTokenPrice,
            }),
        );

        server.use(
            requestMock("https://api.polygonscan.com/api", NetworkFeesFixture, {
                method: "get",
            }),
        );
    });

    it("should navigate to the next step if continue clicked", async () => {
        const setStepMock = vi.fn();

        render(
            <InitiationStep
                {...properties}
                setStep={setStepMock}
            />,
        );

        await userEvent.click(screen.getByTestId("SliderFormActionsToolbar__save"));

        expect(setStepMock).toHaveBeenCalledTimes(1);
    });

    it("should render without token price", async () => {
        const setStepMock = vi.fn();

        render(
            <InitiationStep
                {...{
                    ...properties,
                    transactionIntent: {
                        ...transactionIntent,
                        asset: {
                            ...asset,
                            token_price: null,
                        },
                    },
                }}
                setStep={setStepMock}
            />,
        );

        await userEvent.click(screen.getByTestId("SliderFormActionsToolbar__save"));

        expect(setStepMock).toHaveBeenCalledTimes(1);
    });

    it("should not render token with 0 balance", async () => {
        const withTwoAssets = { ...properties, assets: [asset, secondAsset] };
        render(<InitiationStep {...withTwoAssets} />);

        const selectElement = within(screen.getByTestId("TransactionSendForm_Token_Amount_Select"));

        await userEvent.click(selectElement.getByTestId("Listbox__trigger"));

        expect(selectElement.queryAllByTestId("ListboxOption")).toHaveLength(1);
    });

    it("should show close button if asset not selected", () => {
        const withoutAsset = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                asset: undefined,
            },
        };

        render(<InitiationStep {...withoutAsset} />);

        expect(screen.getByTestId("SliderFormActionsToolbar__cancel")).toHaveTextContent("Close");
    });

    it("handle handleClickMaxButton function", async () => {
        const token = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                nativeToken: undefined,
            },
        };

        render(<InitiationStep {...token} />);

        const selectElement = within(screen.getByTestId("TransactionSendForm_Token_Amount_Select"));

        expect(selectElement.getByTestId("Listbox__trigger")).toBeInTheDocument();
        await userEvent.click(selectElement.getByTestId("Listbox__trigger"));

        expect(selectElement.getAllByTestId("ListboxOption")).toHaveLength(1);
        await userEvent.click(selectElement.getByTestId("ListboxOption"));

        const maxButton = screen.getByTestId("TransactionSendForm_Token_Amount_Button");

        expect(maxButton).toBeInTheDocument();
        await userEvent.click(maxButton);
    });

    it("handle handleChangeAmount function with native token", async () => {
        const withNativeTokenAsset = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                asset: thirdAsset,
            },
        };

        render(<InitiationStep {...withNativeTokenAsset} />);

        const maxButton = screen.getByTestId("TransactionSendForm_Token_Amount_Button");

        await userEvent.click(maxButton);

        expect(dispatchMock).toHaveBeenLastCalledWith({
            type: ActionType.SetAmount,
            payload: "122.999366781624",
        });
    });

    it("handle handleChangeAmount function with non native token", async () => {
        const withNonNativeTokenAsset = {
            transactionIntent: {
                ...transactionIntent,
                asset: secondAsset,
            },
            step: SendTransactionStep.Initiation,
            setStep: vi.fn(),
            assets,
            balance,
            currency,
            onClose: vi.fn(),
            dispatch: vi.fn(),
        };

        render(<InitiationStep {...withNonNativeTokenAsset} />);

        const maxButton = screen.getByTestId("TransactionSendForm_Token_Amount_Button");

        await userEvent.click(maxButton);

        await waitFor(() => {
            expect(withNonNativeTokenAsset.dispatch).toHaveBeenLastCalledWith({
                type: ActionType.SetAmount,
                payload: "0",
            });
        });
    });

    it("handle handleChangeDestinationAddress function", () => {
        render(<InitiationStep {...properties} />);

        const destinationInput = screen.getByTestId("TransactionSendForm_Destination");

        fireEvent.change(destinationInput, { target: { value: "New destination address" } });

        expect(dispatchMock).toHaveBeenCalledWith({
            type: ActionType.SetRecipient,
            payload: "New destination address",
        });
    });

    it("handle handleChangeAmount function", () => {
        const dispatch = vi.fn();
        const properties = {
            step: SendTransactionStep.Initiation,
            setStep: vi.fn(),
            assets,
            balance,
            currency,
            onClose: vi.fn(),
            transactionIntent,
        };

        render(
            <InitiationStep
                {...properties}
                dispatch={dispatch}
            />,
        );

        const amountInput = screen.getByTestId("TransactionSendForm_Token_Amount_Input");

        fireEvent.change(amountInput, { target: { value: "100" } });

        expect(dispatch).toHaveBeenCalledWith({
            type: ActionType.SetAmount,
            payload: "100",
        });
    });

    it("handle handleSelectAsset function", async () => {
        render(<InitiationStep {...properties} />);

        const selectElement = within(screen.getByTestId("TransactionSendForm_Token_Amount_Select"));

        expect(selectElement.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(selectElement.getByTestId("Listbox__trigger"));

        expect(selectElement.getAllByTestId("ListboxOption")).toHaveLength(1);
        await userEvent.click(selectElement.getByTestId("ListboxOption"));

        expect(dispatchMock).toHaveBeenCalledWith({
            type: ActionType.SetAsset,
            payload: assets[0],
        });
    });

    it("handle handleSelectFee function", async () => {
        render(<InitiationStep {...properties} />);

        expect(await screen.findByTestId("TransactionSendForm_Fee_Select")).toBeInTheDocument();

        const selectElement = within(await screen.findByTestId("TransactionSendForm_Fee_Select"));
        expect(selectElement.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(selectElement.getByTestId("Listbox__trigger"));

        expect(await selectElement.findByText("Fast")).toBeInTheDocument();

        await userEvent.click(selectElement.getByText("Fast"));

        expect(dispatchMock).toHaveBeenCalledWith({
            type: ActionType.SetFee,
            payload: {
                type: "Fast",
                maxFee: "171.8",
                maxPriorityFee: "62.839743101",
            },
        });
    });

    it("should show only top 5 assets in the dropdown", async () => {
        const withManyAssets = {
            ...properties,
            assets: Array.from({ length: 8 }).fill(asset) as TokenListItemData[],
        };

        render(<InitiationStep {...withManyAssets} />);

        const selectElement = within(screen.getByTestId("TransactionSendForm_Token_Amount_Select"));

        await userEvent.click(selectElement.getByTestId("Listbox__trigger"));

        expect(selectElement.getAllByTestId("ListboxOption")).toHaveLength(5);
    });

    it("should search tokens", async () => {
        const asset = new TokenListItemDataFactory().create();

        server.use(requestMock(`${BASE_URL}/tokens/search`, [asset, asset]));

        render(<InitiationStep {...properties} />);

        const { searchInput, selectElement } = await getTokenDropdownElements();

        await userEvent.type(searchInput, "l");

        expect(await selectElement.findAllByTestId("ListboxOption")).toHaveLength(2);
        expect(selectElement.getAllByTestId("ListboxOption")[0]).toHaveTextContent(asset.symbol);
    });

    it("should show 'no results' message if no token found when searching", async () => {
        server.use(requestMock(`${BASE_URL}/tokens/search`, []));

        render(<InitiationStep {...properties} />);

        const { searchInput, selectElement } = await getTokenDropdownElements();

        await userEvent.type(searchInput, "l");

        expect(await selectElement.findByText(/No results/i)).toBeInTheDocument();
    });

    it("should show a loading spinner while searching tokens", async () => {
        server.use(requestMock(`${BASE_URL}/tokens/search`, []));

        render(<InitiationStep {...properties} />);

        const { searchInput, selectElement } = await getTokenDropdownElements();

        await userEvent.type(searchInput, "l");

        expect(await selectElement.findByTestId("icon-SpinnerNarrow")).toBeInTheDocument();
    });

    it("should prevent closing token search dropdown when 'space' key pressed", async () => {
        render(<InitiationStep {...properties} />);

        const { searchInput } = await getTokenDropdownElements();

        fireEvent.keyDown(searchInput, {
            key: " ",
            keyCode: 32,
            which: 32,
            code: "Space",
        });

        expect(searchInput).toBeInTheDocument();
    });

    it("should restore initial assets after token search query cleared", async () => {
        server.use(requestMock(`${BASE_URL}/tokens/search`, []));

        render(<InitiationStep {...properties} />);

        const { searchInput, selectElement } = await getTokenDropdownElements();

        await userEvent.type(searchInput, "l");

        expect(await selectElement.findByText(/No results/i)).toBeInTheDocument();

        await userEvent.clear(searchInput);
        expect(await selectElement.findAllByTestId("ListboxOption")).toHaveLength(1);
    });

    it("should show a toast if error occurred while searching tokens", async () => {
        server.use(
            requestMock(`${BASE_URL}/tokens/search`, [], {
                status: 500,
            }),
        );

        const showToastMock = vi.fn();

        vi.spyOn(ToastsHook, "useToasts").mockImplementation(() => ({
            showToast: showToastMock,
            clear: () => {
                console.log("Clearing");
            },
        }));

        render(<InitiationStep {...properties} />);

        const { searchInput } = await getTokenDropdownElements();

        await userEvent.type(searchInput, "l");

        await waitFor(() => {
            expect(showToastMock).toHaveBeenCalledOnce();
        });
    });

    it("only shows the transaction time when a fee is selected", async () => {
        render(<InitiationStep {...properties} />);

        expect(await screen.findByTestId("TransactionSendForm_Fee_Select")).toBeInTheDocument();

        await waitFor(() => {
            expect(
                within(screen.getByTestId("TransactionSendForm_Fee")).queryByTestId("InputGroup__feedback"),
            ).toHaveTextContent("Transaction Time: ~5 minutes");
        });
    });

    it("should show an invalid address error message if the given to address is invalid", () => {
        const invalidAddress = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                recipient: "invalid",
            },
        };

        render(<InitiationStep {...invalidAddress} />);

        expect(screen.getByText(/Destination address is not correct/i)).toBeInTheDocument();
    });

    it("should an invalid amount error message if the given amount > max amount", () => {
        const invalidAmount = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                amount: 999.99,
            },
        };

        render(<InitiationStep {...invalidAmount} />);

        expect(screen.getByText(/Insufficient funds/i)).toBeInTheDocument();
    });

    it("should show a loader while fees are loading", async () => {
        render(<InitiationStep {...properties} />);

        expect(await screen.findByTestId("TransactionSendForm_Fee_Select")).toBeInTheDocument();
    });

    it("should show an empty address and amount if values are not set yet", () => {
        const freshState = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                amount: undefined,
                recipient: undefined,
            },
        };

        render(<InitiationStep {...freshState} />);

        expect(screen.getByTestId("TransactionSendForm_Destination")).toHaveValue("");
        expect(screen.getByTestId("TransactionSendForm_Token_Amount_Input")).toHaveValue(null);
    });

    it("should not show an error message if address and amount are not set yet", () => {
        const freshState = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                amount: undefined,
                recipient: undefined,
            },
        };

        render(<InitiationStep {...freshState} />);

        expect(screen.queryByText(/Insufficient funds/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Destination address is not correct/i)).not.toBeInTheDocument();
    });

    it("should set average fee if none selected", async () => {
        const withoutFee = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                fee: undefined,
            },
        };

        render(<InitiationStep {...withoutFee} />);

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledWith({
                type: ActionType.SetFee,
                payload: {
                    type: "Avg",
                    maxFee: "165.3",
                    maxPriorityFee: "56.339743101",
                },
            });
        });
    });

    it("should render gas fiat price for native token", () => {
        const withNativeToken = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                asset: {
                    ...asset,
                    is_native_token: true,
                },
            },
        };

        render(<InitiationStep {...withNativeToken} />);

        expect(screen.getByTestId("TransactionSendForm_FeeFiat_Input")).toHaveValue("~$0.008");
    });

    it("should render gas fiat price for non-native token", () => {
        const withoutNativeToken = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                asset: {
                    ...asset,
                    is_native_token: false,
                },
            },
        };

        render(<InitiationStep {...withoutNativeToken} />);

        expect(screen.getByTestId("TransactionSendForm_FeeFiat_Input")).toHaveValue("~$0.024");
    });

    it("should render gracefully handle missing currency fiat price", () => {
        const withoutNativeToken = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                nativeTokenPrice: {
                    guid: 1,
                    symbol: nativeToken.symbol,
                    chainId: 137 as App.Enums.Chains,
                    price: {},
                },
            },
        };

        render(<InitiationStep {...withoutNativeToken} />);

        expect(screen.getByTestId("TransactionSendForm_FeeFiat_Input")).toHaveValue("~$0.00");
    });

    it("should render user currency", () => {
        const withoutNativeToken = {
            ...properties,
            currency: "CNY",
        };

        render(<InitiationStep {...withoutNativeToken} />);

        expect(screen.getByTestId("TransactionSendForm_FeeFiat_Input")).toHaveValue("~CN¥0.00");
    });

    it("should render empty string for fee in fiat if native token price doesn't exist", () => {
        const withoutNativeTokenPrice = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                nativeTokenPrice: undefined,
            },
        };

        render(<InitiationStep {...withoutNativeTokenPrice} />);

        expect(screen.getByTestId("TransactionSendForm_FeeFiat_Input")).toHaveValue("");
    });

    it("should render disabled fee element if asset not selected", () => {
        const withoutAsset = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                asset: undefined,
            },
        };

        render(<InitiationStep {...withoutAsset} />);

        expect(screen.queryByTestId("TransactionSendForm_FeeLoader")).not.toBeInTheDocument();
        expect(screen.queryByTestId("TransactionSendForm_NativeTokenLoader")).not.toBeInTheDocument();

        expect(screen.getByTestId("TransactionSendForm_FeeFiat_Input")).toBeDisabled();
        expect(screen.getByText("Transaction Time: ~N/A minutes")).toBeInTheDocument();
    });

    it("should render fee element with red border if error occurred while fetching network fees", async () => {
        server.use(
            requestMock("https://api.polygonscan.com/api", NetworkFeesFixture, {
                method: "get",
                status: 500,
            }),
        );

        render(<InitiationStep {...properties} />);

        const feeElement = within(await screen.findByTestId("TransactionSendForm_Fee_Select"));
        expect(await feeElement.findByTestId("Listbox__trigger")).toHaveClass("border-theme-danger-400");
    });

    it("should re-fetch network fees if the request rate limited", async () => {
        server.use(
            requestMockOnce("https://api.polygonscan.com/api", {
                status: "0",
                message: "NOTOK",
                result: "Max rate limit reached, please use API Key for higher rate limit",
            }),
            requestMockOnce("https://api.polygonscan.com/api", NetworkFeesFixture),
        );

        vi.useFakeTimers({ shouldAdvanceTime: true });

        const withoutFee = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                fee: undefined,
            },
        };

        render(<InitiationStep {...withoutFee} />);

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalledWith({
                type: ActionType.SetFee,
                payload: {
                    type: "Avg",
                    maxFee: "165.3",
                    maxPriorityFee: "56.339743101",
                },
            });
        });
    });

    it("should toggle loading components if native token and/or selected fee not ready", async () => {
        const { rerender } = render(<InitiationStep {...properties} />);

        await waitFor(() => {
            expect(screen.queryByTestId("TransactionSendForm_FeeLoader")).not.toBeInTheDocument();
        });

        expect(screen.queryByTestId("TransactionSendForm_NativeTokenLoader")).not.toBeInTheDocument();

        const withoutNativeToken = {
            ...properties,
            transactionIntent: {
                ...transactionIntent,
                nativeToken: undefined,
            },
        };

        rerender(<InitiationStep {...withoutNativeToken} />);

        expect(screen.getByTestId("TransactionSendForm_FeeLoader")).toBeInTheDocument();
    });
});
