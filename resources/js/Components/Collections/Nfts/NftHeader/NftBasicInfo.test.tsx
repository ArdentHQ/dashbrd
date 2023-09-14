import { NftBasicInfo } from "./NftBasicInfo";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import { render, screen } from "@/Tests/testing-library";

describe("NftBasicInfo", () => {
    it("should render", () => {
        const nft = new NftFactory().create({});

        render(<NftBasicInfo nft={nft} />);

        expect(screen.getByTestId("NftBasicInfo__container")).toBeInTheDocument();
    });

    it("should render collection image and name", () => {
        const collection = new NFTCollectionFactory().create();

        const nft = new NftFactory().create({
            collection,
        });

        render(<NftBasicInfo nft={nft} />);

        expect(screen.getByTestId("NftHeader__collectionImage")).toBeInTheDocument();
        expect(screen.getByTestId("NftHeader__collectionName")).toBeInTheDocument();
    });

    it("should render nft name if available", () => {
        const nft = new NftFactory().create({
            name: "Nft name",
        });

        render(<NftBasicInfo nft={nft} />);

        expect(screen.getByTestId("NftHeader__heading")).toBeInTheDocument();
        expect(screen.getByTestId("NftHeader__heading")).toHaveTextContent("Nft name");
    });

    it("should render nft number if name is not available", () => {
        const nft = new NftFactory().create({
            name: null,
            tokenNumber: "1",
        });

        render(<NftBasicInfo nft={nft} />);

        expect(screen.getByTestId("NftHeader__heading")).toBeInTheDocument();
        expect(screen.getByTestId("NftHeader__heading")).toHaveTextContent("1");
    });
});
