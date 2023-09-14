import { router } from "@inertiajs/react";
import React from "react";
import { NftHeader } from "./NftHeader";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen, userEvent } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

describe("NftHeader", () => {
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
        const nft = new NftFactory().withWallet().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftHeader nft={nft} />);

        expect(screen.getByTestId("NftHeader__collectionName")).toBeInTheDocument();
        expect(screen.getByTestId("NftHeader__heading")).toBeInTheDocument();
    });

    it("hide collection image if is null", () => {
        const nft = new NftFactory().withWallet().create({
            collection: new NFTCollectionFactory().withoutImage().create(),
        });

        render(<NftHeader nft={nft} />);

        expect(screen.queryByTestId("NftHeader__collectionImage")).not.toBeInTheDocument();
    });

    it("visits the collection page on click", async () => {
        const nft = new NftFactory().withWallet().create();

        render(<NftHeader nft={nft} />);

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        await userEvent.click(screen.getByTestId("NftHeader__collectionName"));
        expect(routerSpy).toBeCalledTimes(1);
    });

    it("should render desktop version for large screens", () => {
        const nft = new NftFactory().withWallet().create();

        render(<NftHeader nft={nft} />, { breakpoint: Breakpoint.xl });

        expect(screen.getByTestId("NftHeader__desktop")).toBeInTheDocument();
    });

    it("should render mobile version for small screens", () => {
        const nft = new NftFactory().withWallet().create();

        render(<NftHeader nft={nft} />, { breakpoint: Breakpoint.sm });

        expect(screen.getByTestId("NftHeader__mobile")).toBeInTheDocument();
    });
});
