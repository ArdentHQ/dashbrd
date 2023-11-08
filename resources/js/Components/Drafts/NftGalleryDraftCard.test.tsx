import React from "react";
import { type SpyInstance } from "vitest";
import { NftGalleryDraftCard } from "./NftGalleryDraftCard";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import { type GalleryDraft } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { mockAuthContext, render, screen, userEvent } from "@/Tests/testing-library";

const user = new UserDataFactory().create();
let resetAuthContextMock: () => void;
let useMetaMaskContextSpy: SpyInstance;

describe("NftGalleryDraftCard", () => {
    const draft: GalleryDraft = {
        id: 1,
        title: "Test draft",
        cover: null,
        coverType: null,
        walletAddress: "0x22Fd644149ea87ca26237183ad6A66f91dfcFB87",
        nfts: [],
        value: "0",
        collectionsCount: 0,
        updatedAt: 123,
    };

    beforeEach(() => {
        resetAuthContextMock = mockAuthContext({ user });

        useMetaMaskContextSpy = vi
            .spyOn(useMetaMaskContext, "useMetaMaskContext")
            .mockReturnValue(getSampleMetaMaskState());
    });

    afterEach(() => {
        resetAuthContextMock();

        useMetaMaskContextSpy.mockRestore();
    });

    it("renders", () => {
        render(
            <NftGalleryDraftCard
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftCard")).toBeInTheDocument();
    });

    it("handles on delete", async () => {
        const onDelete = vi.fn();
        render(
            <NftGalleryDraftCard
                draft={draft}
                onDelete={onDelete}
            />,
        );

        await userEvent.click(screen.getByTestId("NftDraftCard__delete-button"));

        expect(onDelete).toHaveBeenCalled();
    });

    it("shows an NFT gallery card for the user when no cover image is set", () => {
        render(
            <NftGalleryDraftCard
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("GalleryCoverImage")).not.toBeInTheDocument();
        expect(screen.getByTestId("NftGalleryDraftImageGrid")).toBeInTheDocument();
    });

    it("shows an NFT gallery card for the user with cover", () => {
        const createObjectURL = vi.fn((blob: Blob): string => `mocked-url:${blob.type}`);
        const originalURL = globalThis.URL;
        originalURL.createObjectURL = createObjectURL;

        const bufferSize = 10;
        const arrayBuffer = new ArrayBuffer(bufferSize);
        const draftWithCover = {
            ...draft,
            cover: arrayBuffer,
            coverType: "image/jpeg",
        };

        render(
            <NftGalleryDraftCard
                draft={draftWithCover}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("GalleryCoverImage")).toBeInTheDocument();
        expect(screen.queryByTestId("NftGalleryDraftImageGrid")).not.toBeInTheDocument();
    });

    it("should send not render address if it is not defined", () => {
        const draftWithoutWalletAddress = {
            ...draft,
            walletAddress: undefined,
        };

        render(
            <NftGalleryDraftCard
                draft={draftWithoutWalletAddress}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("NftGalleryDraftHeading__address")).not.toBeInTheDocument();
    });
});
