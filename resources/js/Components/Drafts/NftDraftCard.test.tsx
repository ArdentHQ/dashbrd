import React from "react";
import { type SpyInstance } from "vitest";
import { NftDraftCard } from "./NftDraftCard";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { mockAuthContext, render, screen } from "@/Tests/testing-library";

const user = new UserDataFactory().create();
let resetAuthContextMock: () => void;
let useMetaMaskContextSpy: SpyInstance;

describe("NftDraftCard", () => {
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

    it("shows an NFT gallery card for the user", () => {
        const gallery = new GalleryDataFactory().withCoverImage().create();

        render(<NftDraftCard gallery={gallery} />);

        expect(screen.getByTestId("NftDraftCard")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryCoverImage")).toBeInTheDocument();
        expect(screen.queryByTestId("NftImageGrid")).not.toBeInTheDocument();
    });

    it("shows an NFT gallery card for the user when no cover image is set", () => {
        const gallery = new GalleryDataFactory().withoutCoverImage().create();

        render(<NftDraftCard gallery={gallery} />);

        expect(screen.getByTestId("NftDraftCard")).toBeInTheDocument();

        expect(screen.getByTestId("NftImageGrid")).toBeInTheDocument();
        expect(screen.queryByTestId("GalleryCoverImage")).not.toBeInTheDocument();
    });
});
