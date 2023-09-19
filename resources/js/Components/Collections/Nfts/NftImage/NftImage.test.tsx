import React from "react";
import { NftImage } from "./NftImage";
import { NftHeader } from "@/Components/Collections/Nfts/NftHeader";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { act, render, screen, userEvent, waitFor } from "@/Tests/testing-library";

vi.mock("file-saver", () => ({
    saveAs: vi.fn(),
}));
describe("NftImage", () => {
    const image = new Image();

    const showConnectOverlayMock = vi.fn().mockImplementation((callback) => {
        callback();
    });

    beforeAll(() => {
        process.env.REACT_APP_IS_UNIT = "false";
        vi.spyOn(window, "Image").mockImplementation(() => image);
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue({
            ...getSampleMetaMaskState(),
            showConnectOverlay: showConnectOverlayMock,
        });
        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render", async () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftImage nft={nft} />);

        act(() => {
            image.onload?.(new Event(""));
        });

        await waitFor(() => {
            expect(screen.getByTestId("NftImage__image")).toBeInTheDocument();
        });
    });

    it("should use large image if both original and originalRaw are missing", async () => {
        const images = new NftImagesDataFactory().withValues().create({
            original: null,
            originalRaw: null,
            large: "https://example.com/largeImage",
        });

        const nft = new NftFactory().create({
            name: "Jack Sparrow",
            images,
        });

        render(<NftImage nft={nft} />);

        act(() => {
            image.onload?.(new Event(""));
        });

        await waitFor(() => {
            expect(screen.getByTestId("NftImage__image")).toBeInTheDocument();
            expect(screen.getByTestId("NftImage__image")).toHaveAttribute("src", images.large);
        });
    });

    it("hide image if no images", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withoutValues().create(),
        });

        render(<NftHeader nft={nft} />);

        expect(screen.queryByTestId("NftImage__image")).not.toBeInTheDocument();
    });

    it("should open image in new tab on click", async () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftImage nft={nft} />);

        act(() => {
            image.onload?.(new Event(""));
        });

        await waitFor(() => {
            expect(screen.getByTestId("NftImage__image")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId("NftImage__image"));

        expect(window.open).toHaveBeenCalledWith(nft.images.original, "_blank");
    });
});
