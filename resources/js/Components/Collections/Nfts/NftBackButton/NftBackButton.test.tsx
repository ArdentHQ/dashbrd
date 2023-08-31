import { NftBackButton } from "./NftBackButton";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import { render, screen } from "@/Tests/testing-library";

describe("NftBackButton", () => {
    const nft = new NftFactory().create();

    it("should render", () => {
        render(
            <NftBackButton
                nft={nft}
                url="https://example.com"
            />,
        );

        expect(screen.getByTestId("NftBackButton")).toBeInTheDocument();

        expect(screen.getByTestId<HTMLAnchorElement>("NftBackButton__urlDesktop").href).toBe("https://example.com/");

        expect(screen.getByTestId<HTMLAnchorElement>("NftBackButton__urlMobile").href).toBe("https://example.com/");
    });
});
