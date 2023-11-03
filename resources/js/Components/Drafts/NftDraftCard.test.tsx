import React from "react";
import { type SpyInstance } from "vitest";
import { NftDraftCard } from "./NftDraftCard";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { mockAuthContext, render, screen } from "@/Tests/testing-library";
import { GalleryDraft } from "@/Pages/Galleries/hooks/useGalleryDrafts";

const user = new UserDataFactory().create();
let resetAuthContextMock: () => void;
let useMetaMaskContextSpy: SpyInstance;

describe("NftDraftCard", () => {
    const draft: GalleryDraft = {
        id: 1,
        title: "Test draft",
        cover: null,
        coverType: null,
        walletAddress: "0x22Fd644149ea87ca26237183ad6A66f91dfcFB87",
        nfts: [],
        value: "0",
        collectionsCount: 0,
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
        render(<NftDraftCard draft={draft} />);

        expect(screen.getByTestId("NftDraftCard")).toBeInTheDocument();
    });

    it("shows an NFT gallery card for the user when no cover image is set", () => {
        render(<NftDraftCard draft={draft} />);

        expect(screen.queryByTestId("GalleryCoverImage")).not.toBeInTheDocument();
        expect(screen.getByTestId("NftDraftImageGrid")).toBeInTheDocument();
    });

    it("shows an NFT gallery card for the user with cover", () => {
        const createObjectURL = vi.fn((blob) => `mocked-url:${blob.type}`);
        const originalURL = globalThis.URL;
        originalURL.createObjectURL = createObjectURL;

        const bufferSize = 10;
        const arrayBuffer = new ArrayBuffer(bufferSize);
        const draftWithCover = {
            ...draft,
            cover: arrayBuffer,
            coverType: "image/jpeg",
        };

        render(<NftDraftCard draft={draftWithCover} />);

        expect(screen.getByTestId("GalleryCoverImage")).toBeInTheDocument();
        expect(screen.queryByTestId("NftDraftImageGrid")).not.toBeInTheDocument();
    });
});
