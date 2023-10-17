import { router } from "@inertiajs/react";
import { within } from "@testing-library/react";
import React from "react";
import { CollectionActivityTable } from "./CollectionActivityTable";
import {
    AddressLink,
    CollectionActivityTableItem,
    Name,
    NameMobile,
    SalePrice,
    Timestamp,
    Type,
} from "@/Components/Collections/CollectionActivityTable/CollectionActivityTable.blocks";
import { ActiveUserContextProvider } from "@/Contexts/ActiveUserContext";
import * as activeUserContextMock from "@/Contexts/ActiveUserContext";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import CollectionNftDataFactory from "@/Tests/Factories/Collections/CollectionNftDataFactory";
import NftActivitiesDataFactory from "@/Tests/Factories/Nfts/NftActivitiesDataFactory";
import NFTActivityFactory from "@/Tests/Factories/Nfts/NFTActivityFactory";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen, userEvent } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

const connectWalletMock = vi.fn();
const defaultMetamaskConfig = getSampleMetaMaskState({
    connectWallet: connectWalletMock,
});

const activities = new NftActivitiesDataFactory().create();

const nativeToken = new TokenDataFactory().create();

describe("AddressLink", () => {
    const address = "0x1234567890123456789012345678901234567890";

    it.each([
        ["Ethereum", "etherscan.io", 1],
        ["Polygon", "polygonscan.com", 137],
    ])("should render for %s network", (_network, _, chainId) => {
        render(
            <AddressLink
                chainId={chainId}
                address={address}
            />,
        );

        expect(screen.getByTestId("CollectionActivityTable_address")).toBeInTheDocument();
    });
});

describe("FormatCrypto", () => {
    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    it("should handle null values FormatCrypto  For sm", () => {
        const collection = new CollectionDetailDataFactory()
            .withNfts()
            .create({ floorPrice: null, floorPriceCurrency: null, floorPriceDecimals: null });

        const onPageLimitChange = vi.fn();
        render(
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                onPageLimitChange={onPageLimitChange}
                pageLimit={10}
                nativeToken={nativeToken}
            />,
            { breakpoint: Breakpoint.sm },
        );

        expect(screen.getByTestId("CollectionActivityTable")).toBeInTheDocument();
    });

    it("should render FormatCrypto For sm", () => {
        const collection = new CollectionDetailDataFactory().withNfts().create({
            floorPrice: (1 * 1e18).toString(),
            floorPriceCurrency: "ETH",
            floorPriceDecimals: 18,
        });

        const onPageLimitChange = vi.fn();
        render(
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                onPageLimitChange={onPageLimitChange}
                pageLimit={10}
                nativeToken={nativeToken}
            />,
            { breakpoint: Breakpoint.sm },
        );

        expect(screen.getByTestId("CollectionActivityTable")).toBeInTheDocument();
    });
});

describe("SalePrice", () => {
    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    it("should handle null cases SalePrice ", () => {
        render(
            <SalePrice
                usdPrice={null}
                nativePrice={null}
                nativeToken={nativeToken}
            />,
        );

        expect(screen.getByTestId("CollectionActivityTable_salePrice")).toBeInTheDocument();
    });

    it.each([
        ["short", "xs", "$45.2"],
        ["full", "md", "$45.23"],
    ])("should show %s fiat value based on the screen size", (_, breakpoint, fiat) => {
        render(
            <SalePrice
                usdPrice={"45.23"}
                nativePrice={"125.25"}
                nativeToken={nativeToken}
            />,
            { breakpoint: breakpoint as Breakpoint },
        );

        expect(screen.getByText(fiat)).toBeInTheDocument();
    });
});

describe("Type", () => {
    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });
    const collection = new CollectionDetailDataFactory().withNfts().create();
    it.each([
        ["Ethereum", "etherscan.io", 1],
        ["Polygon", "polygonscan.com", 137],
    ])("should render for %s network", (_network, hostname, chainId) => {
        const activity = new NFTActivityFactory().create({
            type: "LABEL_TRANSFER",
            sender: "0x1234567890123456789012345678901234567890",
            recipient: "0x1234567890123456789012345678901234567890",
        });

        render(
            <Type
                chainId={chainId}
                activity={activity}
                collection={collection}
                showNameColumn
            />,
        );

        expect(screen.getByRole("link", { name: "Transfer" })).toHaveAttribute(
            "href",
            `https://${hostname}/tx/${activity.id}`,
        );
    });

    it("should render with image in sm", () => {
        const activity = new NFTActivityFactory().create({
            type: "LABEL_TRANSFER",
            nft: new CollectionNftDataFactory().withImages().create(),
        });

        render(
            <Type
                chainId={1}
                activity={activity}
                collection={collection}
                showNameColumn
            />,
            {
                breakpoint: Breakpoint.sm,
            },
        );

        expect(screen.getByTestId("ActivityTable__image")).toBeInTheDocument();
    });

    it("should render without image in sm", () => {
        const activity = new NFTActivityFactory().create({
            type: "LABEL_TRANSFER",
            nft: new CollectionNftDataFactory().withoutImages().create(),
        });

        render(
            <Type
                chainId={1}
                activity={activity}
                collection={collection}
                showNameColumn
            />,
            {
                breakpoint: Breakpoint.sm,
            },
        );

        expect(screen.getByTestId("ActivityTable__image")).toBeInTheDocument();
    });

    it("should render without image in sm", () => {
        const activity = new NFTActivityFactory().create({
            type: "LABEL_SALE",
            nft: new CollectionNftDataFactory().withoutImages().create(),
        });

        render(
            <Type
                chainId={1}
                activity={activity}
                collection={collection}
                showNameColumn
            />,
            {
                breakpoint: Breakpoint.sm,
            },
        );

        expect(screen.getByTestId("ActivityTable__image")).toBeInTheDocument();
    });
});

describe("Image", () => {
    const collection = new CollectionDetailDataFactory().withNfts().create();
    const activity = new NFTActivityFactory().create({
        type: "LABEL_TRANSFER",
        nft: new CollectionNftDataFactory().withoutImages().create(),
    });
    it("should render with image", () => {
        render(
            <Name
                activity={activity}
                collection={collection}
            />,
        );

        expect(screen.getByTestId("ActivityTable__name")).toBeInTheDocument();

        expect(screen.getByTestId("ActivityTable__image")).toBeInTheDocument();
    });

    it("should render without image", () => {
        render(
            <Name
                activity={activity}
                collection={collection}
            />,
        );
        expect(screen.getByTestId("ActivityTable__image")).toBeInTheDocument();
    });
    it("visits the collection page on click", async () => {
        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        render(
            <Name
                activity={activity}
                collection={collection}
            />,
        );

        await userEvent.click(screen.getByTestId("ActivityTable__name"));

        expect(routerSpy).toHaveBeenCalled();
    });

    it("visits the collection page on click mobile name ", async () => {
        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        render(
            <NameMobile
                activity={activity}
                collection={collection}
            />,
        );

        await userEvent.click(screen.getByTestId("ActivityTable__name_mobile"));

        expect(routerSpy).toHaveBeenCalled();
    });
});

describe("TimeStamp", () => {
    const activity = new NFTActivityFactory().create({
        type: "LABEL_TRANSFER",
        nft: new CollectionNftDataFactory().withoutImages().create(),
        timestamp: 1699660800,
    });

    it("Timestamp rendered", () => {
        render(<Timestamp value={activity.timestamp} />);

        expect(screen.getByTestId("ActivityTable__timestamp")).toBeInTheDocument();
    });

    it("should render timestamp for guests", () => {
        const activeUserSpy = vi.spyOn(activeUserContextMock, "useActiveUser").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            signed: false,
            logout: vi.fn(),
            setAuthData: vi.fn(),
        });

        render(<Timestamp value={activity.timestamp} />);

        expect(screen.getByTestId("ActivityTable__timestamp")).toBeInTheDocument();

        activeUserSpy.mockRestore();
    });
});

describe("CollectionActivityTableItem", () => {
    const user = new UserDataFactory().create();
    const wallet = new WalletFactory().create();
    const token = new TokenDataFactory().create();
    const collection = new CollectionDetailDataFactory().withNfts().create();
    const activity = new NFTActivityFactory().create({
        type: "LABEL_TRANSFER",
        nft: new CollectionNftDataFactory().withoutImages().create(),
    });

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    it("should render collection activity table items with/without bottom border", () => {
        const { rerender } = render(
            <ActiveUserContextProvider initialAuth={{ user, wallet, authenticated: true, signed: false }}>
                <table>
                    <tbody>
                        <CollectionActivityTableItem
                            activity={activity}
                            collection={collection}
                            isCompact={false}
                            showNameColumn={false}
                            nativeToken={token}
                            hasBorderBottom={true}
                        />
                    </tbody>
                </table>
            </ActiveUserContextProvider>,
        );

        expect(screen.getByTestId("ActivityTable__Row")).toHaveClass("last:border-solid");

        rerender(
            <ActiveUserContextProvider initialAuth={{ user, wallet, authenticated: true, signed: false }}>
                <table>
                    <tbody>
                        <CollectionActivityTableItem
                            activity={activity}
                            collection={collection}
                            isCompact={false}
                            showNameColumn={false}
                            nativeToken={token}
                        />
                    </tbody>
                </table>
            </ActiveUserContextProvider>,
        );

        expect(screen.getByTestId("ActivityTable__Row")).not.toHaveClass("last:border-solid");
        expect(screen.getByTestId("ActivityTable__Row")).toHaveClass("last:border-b-0");
    });

    it("should show N/A as a price for mint activity type", () => {
        const activity = new NFTActivityFactory().create({
            type: "LABEL_MINT",
            nft: new CollectionNftDataFactory().withoutImages().create(),
        });

        render(
            <table>
                <tbody>
                    <CollectionActivityTableItem
                        activity={activity}
                        collection={collection}
                        isCompact={false}
                        showNameColumn={false}
                        nativeToken={token}
                    />
                </tbody>
            </table>,
        );

        const priceContainer = within(screen.getByTestId("CollectionActivityTable_salePrice"));

        expect(priceContainer.getByText("N/A")).toBeInTheDocument();
    });
});
