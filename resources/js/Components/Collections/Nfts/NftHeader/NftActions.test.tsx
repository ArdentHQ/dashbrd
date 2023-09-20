import { t } from "i18next";
import { NftActions } from "./NftActions";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { act, fireEvent, render, screen, userEvent } from "@/Tests/testing-library";
import { ExplorerChains } from "@/Utils/Explorer";

describe("Nftactions", () => {
    const showConnectOverlayMock = vi.fn().mockImplementation((callback) => {
        callback();
    });
    const image = new Image();

    beforeAll(() => {
        process.env.REACT_APP_IS_UNIT = "false";
        vi.spyOn(window, "Image").mockImplementation(() => image);
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...getSampleMetaMaskState(),
            showConnectOverlay: showConnectOverlayMock,
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        act(() => {
            image.onload?.(new Event(""));
        });

        expect(screen.getByTestId("NftActions__container")).toBeInTheDocument();
    });

    it("should refresh succesfully", async () => {
        server.use(requestMock(`${BASE_URL}/nft/refresh`, { success: true }, { method: "post" }));

        server.use(
            requestMock(
                "http://localhost/api",
                {
                    success: true,
                },
                {
                    method: "post",
                },
            ),
        );

        const user = new UserDataFactory().create();
        const wallet = new WalletFactory().create();

        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        await userEvent.click(screen.getByTestId("NftActions__refresh"));
        expect(showConnectOverlayMock).not.toHaveBeenCalled();
        expect(screen.getByTestId("NftActions__refresh")).toBeDisabled();
    });

    it("should display connect overlay if there is no user", () => {
        server.use(requestMock(`${BASE_URL}/nft/refresh`, { success: true }, { method: "post" }));

        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        server.use(
            requestMock(
                "http://localhost/api",
                {
                    success: true,
                },
                {
                    method: "post",
                },
            ),
        );

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        fireEvent.click(screen.getByTestId("NftActions__refresh"));

        expect(showConnectOverlayMock).toHaveBeenCalled();
    });

    it("should render polygon network icon and tooltip if chain is polygon", async () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.PolygonMainnet,
        });

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
            collection,
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        expect(screen.getByTestId("NftActions__viewOnChain")).toBeInTheDocument();
        expect(screen.getByTestId("Polygon")).toBeInTheDocument();
        await userEvent.hover(screen.getByTestId("NftActions__viewOnChain"));
        expect(screen.getByText(t("common.view_nft_on_polygonscan").toString())).toBeInTheDocument();
    });

    it("should render ethereum network icon and tooltip if chain is ethereum", async () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.EthereumMainnet,
        });

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
            collection,
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        expect(screen.getByTestId("NftActions__viewOnChain")).toBeInTheDocument();
        expect(screen.getByTestId("Ethereum")).toBeInTheDocument();
        await userEvent.hover(screen.getByTestId("NftActions__viewOnChain"));
        expect(screen.getByText(t("common.view_nft_on_etherscan").toString())).toBeInTheDocument();
    });

    it("should redirect to polygonscan if chain is polygon", () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.PolygonMainnet,
        });

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
            collection,
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        expect(screen.getByTestId("NftActions__viewOnChain")).toBeInTheDocument();
        expect(screen.getByTestId("NftActions__viewOnChain")).toHaveAttribute(
            "href",
            `https://polygonscan.com/nft/${collection.address}/${nft.tokenNumber}`,
        );
    });

    it("should redirect to etherscan if chain is ethereum", () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.EthereumMainnet,
        });

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
            collection,
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        expect(screen.getByTestId("NftActions__viewOnChain")).toBeInTheDocument();
        expect(screen.getByTestId("NftActions__viewOnChain")).toHaveAttribute(
            "href",
            `https://etherscan.io/nft/${collection.address}/${nft.tokenNumber}`,
        );
    });

    it("should redirect to goerli explorer if chain is ethereum testnet", () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.EthereumTestnet,
        });

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
            collection,
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        expect(screen.getByTestId("NftActions__viewOnChain")).toBeInTheDocument();
        expect(screen.getByTestId("NftActions__viewOnChain")).toHaveAttribute(
            "href",
            `https://goerli.etherscan.io/nft/${collection.address}/${nft.tokenNumber}`,
        );
    });

    it("should redirect to mumbai explorer if chain is polygon testnet", () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.PolygonTestnet,
        });

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
            collection,
        });

        render(
            <NftActions
                nft={nft}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        expect(screen.getByTestId("NftActions__viewOnChain")).toBeInTheDocument();
        expect(screen.getByTestId("NftActions__viewOnChain")).toHaveAttribute(
            "href",
            `https://mumbai.polygonscan.com/nft/${collection.address}/${nft.tokenNumber}`,
        );
    });
});
