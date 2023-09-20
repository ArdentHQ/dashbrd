import { NftOwner } from "./NftOwner";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import NftWalletFactory from "@/Tests/Factories/Nfts/NftWalletFactory";
import { render, screen } from "@/Tests/testing-library";
import { ExplorerChains } from "@/Utils/Explorer";

describe("NftOwner", () => {
    it("should render", () => {
        const nft = new NftFactory().withWallet().create();

        render(<NftOwner nft={nft} />);

        expect(screen.getByTestId("NftOwner__walletAddress")).toBeInTheDocument();
    });

    it("should render NA if no wallet", () => {
        const nft = new NftFactory().withoutWallet().create();

        render(<NftOwner nft={nft} />);

        expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("should render owner address", () => {
        const nft = new NftFactory().withWallet().create();

        render(<NftOwner nft={nft} />);

        expect(screen.getByTestId("NftOwner__walletAddress")).toBeInTheDocument();
    });

    it("should render owner address with link to polygon explorer", () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.PolygonMainnet,
        });
        const wallet = new NftWalletFactory().create();
        const nft = new NftFactory().withWallet().create({
            collection,
            wallet,
        });

        render(<NftOwner nft={nft} />);

        expect(screen.getByTestId("NftOwner__walletAddress")).toBeInTheDocument();
        expect(nft.wallet).not.toBeNull();
        expect(screen.getByTestId("NftOwner__walletAddress")).toHaveAttribute(
            "href",
            `https://polygonscan.com/address/${wallet.address}`,
        );
    });

    it("should render owner address with link to ethereum explorer", () => {
        const collection = new NFTCollectionFactory().create({
            chainId: ExplorerChains.EthereumMainnet,
        });
        const wallet = new NftWalletFactory().create();
        const nft = new NftFactory().withWallet().create({
            collection,
            wallet,
        });

        render(<NftOwner nft={nft} />);

        expect(screen.getByTestId("NftOwner__walletAddress")).toBeInTheDocument();
        // Check if the link is correct
        expect(screen.getByTestId("NftOwner__walletAddress")).toHaveAttribute(
            "href",
            `https://etherscan.io/address/${wallet.address}`,
        );
    });
});
