import { screen } from "@testing-library/react";
import { expect } from "vitest";
import { type TransactionIntent, TransactionState } from "@/Components/TransactionFormSlider";
import { ResultStep } from "@/Components/TransactionFormSlider/Steps/ResultStep";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuthOverlay";

import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render } from "@/Tests/testing-library";
import { toHuman } from "@/Utils/dates";

describe("ResultStep", () => {
    const user = new UserDataFactory().withUSDCurrency().create();

    const asset = new TokenListItemDataFactory().create({
        name: "BRDY TOKEN",
        symbol: "BRDY",
        decimals: 18,
        balance: (123 * 1e18).toString(),
        percentage: "1",
        fiat_balance: "321",
        token_price: "10",
    });

    const currency = "USD";

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
        hash: "0xUeURWAhryf9UALriJiJHzUMdRBW5YlNOAUzVhYqBEyVaEyx8x2cTNjSx6Vfxsj",
    };

    const properties = {
        onClose: vi.fn(),
        transactionIntent,
        user,
    };

    // stripped receipt object
    const receipt = {
        to: "0x0123456789012345678901234567890123456789",
        from: "0x1234567890123456789012345678901234567890",
        contractAddress: null,
        transactionIndex: 5,
        gasUsed: {
            type: "BigNumber",
            hex: "0x69d6",
        },
        blockHash: "0x8362467b7aa6b3cb11c9b4cf17fa579016465eed13c364326f0b1c390cbcb2ca",
        blockNumber: 38258227,
        confirmations: 3,
        effectiveGasPrice: {
            type: "BigNumber",
            hex: "0x07b12573fc",
        },
        status: 1,
        type: 2,
    };

    // stripped block object
    const block = {
        hash: "0x3fc4f6fc33073f6af2bbbfbf82c24a7e4b45011351220e2cc095a39c3b2d6653",
        parentHash: "0x27bd2002a955324d0898401054076cdac6e4f9b3a51baa0dff4565e76575e6fc",
        timestamp: 1689932903,
        nonce: "0x0000000000000000",
        gasUsed: {
            type: "BigNumber",
            hex: "0x61eb94",
        },
        baseFeePerGas: {
            type: "BigNumber",
            hex: "0x10",
        },
    };

    const defaultMetamaskConfig = getSampleMetaMaskState({
        chainId: 137 as App.Enums.Chains,
        getTransactionReceipt: vi.fn().mockReturnValue({
            data: receipt,
        }),
        getBlock: vi.fn().mockReturnValue({
            data: block,
        }),
    });

    beforeEach(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet: null,
            authenticated: false,
            signed: false,
            showAuthOverlay: true,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    it("should show a skeleton while fetching receipt & block data", async () => {
        render(<ResultStep {...properties} />);

        expect(await screen.findByTestId("ResultStep_TimestampSkeleton")).toBeInTheDocument();
    });

    it("should show a timestamp if block data is fetched", async () => {
        render(<ResultStep {...properties} />);

        const timestamp = toHuman(1689932903 * 1000, user.attributes);

        expect(await screen.findByTestId("ResultStep_TimestampValue")).toBeInTheDocument();
        expect(screen.getByTestId("ResultStep_TimestampValue")).toHaveTextContent(timestamp);

        expect(screen.queryByTestId("ResultStep_TimestampSkeleton")).not.toBeInTheDocument();
    });

    it("should show a failed message if transaction receipt status is not 1", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            getTransactionReceipt: vi.fn().mockReturnValue({ data: { ...receipt, status: 0 } }),
        });

        render(<ResultStep {...properties} />);

        expect(await screen.findByTestId("TransactionStatus__Errored")).toBeInTheDocument();
    });

    it("should show a failed message if fetching transaction receipt fails", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            getTransactionReceipt: vi.fn().mockReturnValue({ errorMessage: "Couldn't get transaction receipt" }),
        });

        render(<ResultStep {...properties} />);

        expect(await screen.findByTestId("TransactionStatus__Errored")).toBeInTheDocument();
    });

    it("should show a failed message if fetching transaction block fails", async () => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...defaultMetamaskConfig,
            getBlock: vi.fn().mockReturnValue({ errorMessage: "Couldn't get transaction receipt" }),
        });

        render(<ResultStep {...properties} />);

        expect(await screen.findByTestId("TransactionStatus__Errored")).toBeInTheDocument();
    });

    it("should show a pending message while fetching receipt and block data", async () => {
        render(<ResultStep {...properties} />);

        expect(await screen.findByTestId("TransactionStatus__Pending")).toBeInTheDocument();
    });

    it("should show a confirmed message if block data successfully fetched", async () => {
        render(<ResultStep {...properties} />);

        expect(await screen.findByTestId("TransactionStatus__Confirmed")).toBeInTheDocument();
    });
});
