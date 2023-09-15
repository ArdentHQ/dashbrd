import { fireEvent } from "@testing-library/dom";
import { saveAs } from "file-saver";
import { t } from "i18next";
import React from "react";
import { NftImage } from "./NftImage";
import { NftHeader } from "@/Components/Collections/Nfts/NftHeader";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { act, render, screen, userEvent, waitFor } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

vi.mock("file-saver", () => ({
    saveAs: vi.fn(),
}));
describe("NftImage", () => {
    const image = new Image();
    const showConnectOverlayMock = vi.fn();

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
            signed: true,
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

        expect(screen.getByTestId("NftImage__zoomModal")).toBeInTheDocument();
        expect(screen.getByTestId("NftImage__saveAs")).toBeInTheDocument();

        act(() => {
            image.onload?.(new Event(""));
        });

        await waitFor(() => {
            expect(screen.getByTestId("NftImage__image")).toBeInTheDocument();
        });
    });

    it("should use originalRaw image if original image is missing", async () => {
        const images = new NftImagesDataFactory().withValues().create({
            original: null,
        });

        const nft = new NftFactory().create({
            name: "Anakin Skywalker",
            images,
        });

        render(<NftImage nft={nft} />);

        await userEvent.click(screen.getByTestId("NftImage__zoomModal"));

        act(() => {
            image.onload?.(new Event(""));
        });

        expect(screen.getByTestId("NftImage__zoomImage")).toBeInTheDocument();
        expect(screen.getByTestId("NftImage__zoomImage").getAttribute("src")).toBe(images.originalRaw);

        fireEvent.click(screen.getByTestId("NftImage__saveAs"));
        expect(saveAs).toHaveBeenCalledWith(images.originalRaw, nft.name);
    });

    it("should use large image if both original and originalRaw are missing", async () => {
        const images = new NftImagesDataFactory().withValues().create({
            original: null,
            originalRaw: null,
        });

        const nft = new NftFactory().create({
            name: "Jack Sparrow",
            images,
        });

        render(<NftImage nft={nft} />);

        await userEvent.click(screen.getByTestId("NftImage__zoomModal"));

        act(() => {
            image.onload?.(new Event(""));
        });

        expect(screen.getByTestId("NftImage__zoomImage")).toBeInTheDocument();
        expect(screen.getByTestId("NftImage__zoomImage").getAttribute("src")).toBe(images.large);

        fireEvent.click(screen.getByTestId("NftImage__saveAs"));
        expect(saveAs).toHaveBeenCalledWith(images.large, nft.name);
    });

    it("disables the buttons if no images", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withoutValues().create(),
        });

        render(<NftImage nft={nft} />);

        expect(screen.getByTestId("NftImage__zoomModal")).toBeDisabled();
        expect(screen.getByTestId("NftImage__saveAs")).toBeDisabled();
    });

    it("hide image if no images", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withoutValues().create(),
        });

        render(<NftHeader nft={nft} />);

        expect(screen.queryByTestId("NftImage__image")).not.toBeInTheDocument();
    });

    it("show/hide zoom modal", async () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftImage nft={nft} />);

        await userEvent.click(screen.getByTestId("NftImage__zoomModal"));
        expect(screen.getByTestId("ZoomDialog")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ZoomDialog__close"));
        expect(screen.queryByTestId("ZoomDialog")).not.toBeInTheDocument();
    });

    it("download image", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftImage nft={nft} />);

        fireEvent.click(screen.getByTestId("NftImage__saveAs"));
        expect(saveAs).toHaveBeenCalled();
    });

    it("download image without NFT name", () => {
        const nft = new NftFactory().create({
            name: null,
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftImage nft={nft} />);

        fireEvent.click(screen.getByTestId("NftImage__saveAs"));
        expect(saveAs).toHaveBeenCalled();
    });

    it("should disabled zoom if image fails to load", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create({
                large: "@!##$%%%%$@#",
            }),
        });

        render(<NftImage nft={nft} />);

        act(() => {
            image.onerror?.(new Event(""));
        });

        expect(screen.getByTestId("NftImage__zoomModal")).toBeDisabled();
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

        render(<NftImage nft={nft} />);

        await userEvent.click(screen.getByTestId("NftImage__refresh"));
        expect(screen.getByTestId("NftImage__refresh")).toBeDisabled();
    });

    it("cannot select with click on desktop", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create({
                large: "@!##$%%%%$@#",
            }),
        });

        render(<NftImage nft={nft} />, {
            breakpoint: Breakpoint.xl,
        });

        expect(screen.getByTestId("GalleryCard__overlay")).toHaveClass("pointer-events-none");

        fireEvent.click(screen.getByTestId("GalleryCard"));

        expect(screen.getByTestId("GalleryCard__overlay")).toHaveClass("pointer-events-none");
    });

    it("cannot select on mobile", () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create({
                large: "@!##$%%%%$@#",
            }),
        });

        render(<NftImage nft={nft} />, {
            breakpoint: Breakpoint.sm,
        });

        expect(screen.getByTestId("GalleryCard__overlay")).toHaveClass("pointer-events-none");

        fireEvent.click(screen.getByTestId("GalleryCard"));

        expect(screen.getByTestId("GalleryCard__overlay")).toHaveClass("pointer-events-none");
    });

    it("should render icon buttons with tooltips", async () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftImage nft={nft} />);

        await userEvent.hover(screen.getByTestId("NftImage__zoomModal"));
        expect(screen.getByText(t("common.zoom"))).toBeInTheDocument();

        await userEvent.hover(screen.getByTestId("NftImage__saveAs"));
        expect(screen.getByText(t("common.download"))).toBeInTheDocument();

        await userEvent.hover(screen.getByTestId("NftImage__refresh"));
        expect(screen.getByText(t("common.refresh_metadata"))).toBeInTheDocument();
    });

    it("should show auth overlay if guest clicks on metadata refresh", async () => {
        const nft = new NftFactory().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            showAuthOverlay: false,
            showCloseButton: false,
            signed: false,
            closeOverlay: vi.fn(),
        });

        render(<NftImage nft={nft} />);

        await userEvent.click(screen.getByTestId("NftImage__refresh"));
        expect(showConnectOverlayMock).toHaveBeenCalledOnce();
    });
});
