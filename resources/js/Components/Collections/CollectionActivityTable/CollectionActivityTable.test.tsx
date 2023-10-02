import React from "react";
import { AddressLink } from "./CollectionActivityTable.blocks";
import { CollectionActivityTable } from "@/Components/Collections/CollectionActivityTable/CollectionActivityTable";
import { Skeleton } from "@/Components/Skeleton";
import { TableCell } from "@/Components/Table";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import NftActivitiesDataFactory from "@/Tests/Factories/Nfts/NftActivitiesDataFactory";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen, userEvent, within } from "@/Tests/testing-library";
import { allBreakpoints, Breakpoint } from "@/Tests/utils";
import { FormatCrypto } from "@/Utils/Currency";

const collection = new CollectionDetailDataFactory().withNfts().create();

const activities = new NftActivitiesDataFactory().create();

const connectWalletMock = vi.fn();
const defaultMetamaskConfig = getSampleMetaMaskState({
    connectWallet: connectWalletMock,
});

const nativeToken = new TokenDataFactory().create();

describe("CollectionActivityTable", () => {
    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(defaultMetamaskConfig);
    });

    it.each(allBreakpoints)("should render with name column in %s screen", (breakpoint) => {
        render(
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                showNameColumn
                onPageLimitChange={vi.fn()}
                pageLimit={10}
                nativeToken={nativeToken}
            />,
            { breakpoint },
        );

        if (breakpoint === Breakpoint.xs) {
            expect(screen.getByTestId("CollectionActivityTable__Mobile")).toBeInTheDocument();
        } else {
            expect(screen.getByTestId("CollectionActivityTable")).toBeInTheDocument();
        }
    });

    it.each(allBreakpoints)("should render loading %s screen", (breakpoint) => {
        render(
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                isLoading
                onPageLimitChange={vi.fn()}
                pageLimit={10}
                nativeToken={nativeToken}
            />,
            { breakpoint },
        );

        if (breakpoint === Breakpoint.xs) {
            expect(screen.getByTestId("CollectionActivityTable__Mobile")).toBeInTheDocument();
        } else {
            expect(screen.getByTestId("CollectionActivityTable")).toBeInTheDocument();
        }
    });

    it.each(allBreakpoints)("should render loading and with name column in %s screen", (breakpoint) => {
        render(
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                isLoading
                showNameColumn
                onPageLimitChange={vi.fn()}
                pageLimit={10}
                nativeToken={nativeToken}
            />,
            { breakpoint },
        );

        if (breakpoint === Breakpoint.xs) {
            expect(screen.getByTestId("CollectionActivityTable__Mobile")).toBeInTheDocument();
        } else {
            expect(screen.getByTestId("CollectionActivityTable")).toBeInTheDocument();
        }
    });

    it("calls onPageLimitChange when page limit changes", async () => {
        const onPageLimitChange = vi.fn();
        const activities = new NftActivitiesDataFactory().create({
            paginated: {
                data: [],
                links: [],
                meta: {
                    current_page: 1,
                    first_page_url: "http://dashbrd.test?page=1",
                    from: 1,
                    last_page: 3,
                    last_page_url: "http://dashbrd.test?page=3",
                    next_page_url: "http://dashbrd.test?page=2",
                    path: "http://dashbrd.test",
                    per_page: 5,
                    prev_page_url: null,
                    to: 5,
                    total: 15,
                },
            },
        });
        render(
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                isLoading
                showNameColumn
                onPageLimitChange={onPageLimitChange}
                pageLimit={10}
                nativeToken={nativeToken}
            />,
            { breakpoint: Breakpoint.lg },
        );

        const pageLimitSelect = within(screen.getByTestId("Listbox"));

        expect(pageLimitSelect.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(pageLimitSelect.getByTestId("Listbox__trigger"));

        await userEvent.click(screen.getByText("25"));

        expect(onPageLimitChange).toHaveBeenCalledWith(25);
    });

    it("calls onPageLimitChange when page limit changes on xs", async () => {
        const onPageLimitChange = vi.fn();
        const activities = new NftActivitiesDataFactory().create({
            paginated: {
                data: [],
                links: [],
                meta: {
                    current_page: 1,
                    first_page_url: "http://dashbrd.test?page=1",
                    from: 1,
                    last_page: 3,
                    last_page_url: "http://dashbrd.test?page=3",
                    next_page_url: "http://dashbrd.test?page=2",
                    path: "http://dashbrd.test",
                    per_page: 5,
                    prev_page_url: null,
                    to: 5,
                    total: 15,
                },
            },
        });

        render(
            <CollectionActivityTable
                collection={collection}
                activities={activities}
                isLoading
                showNameColumn
                onPageLimitChange={onPageLimitChange}
                pageLimit={10}
                nativeToken={nativeToken}
            />,
            { breakpoint: Breakpoint.xs },
        );

        const pageLimitSelect = within(screen.getByTestId("Listbox"));

        expect(pageLimitSelect.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(pageLimitSelect.getByTestId("Listbox__trigger"));

        await userEvent.click(screen.getByText("25"));

        expect(onPageLimitChange).toHaveBeenCalledWith(25);
    });

    it("should handle null values FormatCrypto For XL", () => {
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
        );

        expect(screen.getByTestId("CollectionActivityTable")).toBeInTheDocument();
    });

    it("should render FormatCrypto For XL", () => {
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
        );
        expect(screen.getByTestId("CollectionActivityTable")).toBeInTheDocument();
    });

    it("should handle null values FormatCrypto  For xs", () => {
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
            { breakpoint: Breakpoint.xs },
        );

        expect(screen.getByTestId("CollectionActivityTable__Mobile")).toBeInTheDocument();
    });

    it("should render FormatCrypto For xs", () => {
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
            { breakpoint: Breakpoint.xs },
        );

        expect(screen.getByTestId("CollectionActivityTable__Mobile")).toBeInTheDocument();
    });

    it.each(allBreakpoints)("should render AddressLink when isMd", (breakpoint) => {
        const isMd = breakpoint === Breakpoint.md;
        const address = "0x1234567890123456789012345678901234567890";

        render(
            <AddressLink
                address={address}
                chainId={collection.chainId}
                length={isMd ? 9 : 12}
            />,
            { breakpoint },
        );
        expect(screen.getByTestId("CollectionActivityTable_address")).toBeInTheDocument();
    });

    it.each(allBreakpoints)("renders TableCell with Skeleton when isMdLgAndAbove", (breakpoint) => {
        const isMdLgAndAbove = ["md", "lg", "xl"].includes(breakpoint);

        const screen = render(
            <table>
                <tbody>
                    <tr>
                        <TableCell variant={isMdLgAndAbove ? "middle" : "end"}>
                            <Skeleton
                                height={16}
                                width={140}
                            />
                        </TableCell>
                    </tr>
                </tbody>
            </table>,
        );

        const tableCell = screen.getByTestId("TableCell");
        expect(tableCell).toBeInTheDocument();

        const skeleton = screen.getByTestId("Skeleton");
        expect(skeleton).toBeInTheDocument();

        expect(tableCell).toContainElement(skeleton);
    });

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
});
