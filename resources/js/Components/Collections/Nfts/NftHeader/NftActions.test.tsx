import { t } from "i18next";
import { NftActions } from "./NftActions";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { act, render, screen, userEvent } from "@/Tests/testing-library";
import { ExplorerChains } from "@/Utils/Explorer";

describe("Nftactions", () => {
    const image = new Image();

    beforeAll(() => {
        process.env.REACT_APP_IS_UNIT = "false";
        vi.spyOn(window, "Image").mockImplementation(() => image);
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(getSampleMetaMaskState());
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
                addTestIds={true}
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

        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(
            <NftActions
                nft={nft}
                addTestIds={true}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        await userEvent.click(screen.getByTestId("NftActions__refresh"));
        expect(screen.getByTestId("NftActions__refresh")).toBeDisabled();
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
                addTestIds={true}
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
                addTestIds={true}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        expect(screen.getByTestId("NftActions__viewOnChain")).toBeInTheDocument();
        expect(screen.getByTestId("Ethereum")).toBeInTheDocument();
        await userEvent.hover(screen.getByTestId("NftActions__viewOnChain"));
        expect(screen.getByText(t("common.view_nft_on_etherscan").toString())).toBeInTheDocument();
    });

    it("should redirect to polygonscan if chain is polygon", async () => {
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
                addTestIds={true}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        await userEvent.click(screen.getByTestId("NftActions__viewOnChain"));

        // Window should open new tab with polygonscan
        expect(window.open).toHaveBeenCalledWith(
            `https://polygonscan.com/token/${collection.address}?a=${nft.tokenNumber}`,
            "_blank",
        );
    });

    it("should redirect to etherscan if chain is ethereum", async () => {
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
                addTestIds={true}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        await userEvent.click(screen.getByTestId("NftActions__viewOnChain"));

        // Window should open new tab with etherscan
        expect(window.open).toHaveBeenCalledWith(
            `https://etherscan.io/token/${collection.address}?a=${nft.tokenNumber}`,
            "_blank",
        );
    });

    it("should redirect to mumbai if chain is polygon testnet", async () => {
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
                addTestIds={true}
                alreadyReported={false}
                reportAvailableIn={null}
            />,
        );

        await userEvent.click(screen.getByTestId("NftActions__viewOnChain"));

        // Window should open new tab with mumbai
        expect(window.open).toHaveBeenCalledWith(
            `https://mumbai.polygonscan.com/token/${collection.address}?a=${nft.tokenNumber}`,
            "_blank",
        );
    });
});
