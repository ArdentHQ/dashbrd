import React from "react";
import { NftGalleryCard } from "./NftGalleryCard";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen } from "@/Tests/testing-library";

const user = new UserDataFactory().create();

describe("NftGalleryCard", () => {
    vi.spyOn(useAuth, "useAuth").mockReturnValue({
        user,
        wallet: null,
        authenticated: true,
        showAuthOverlay: false,
        showCloseButton: false,
        signed: false,
        closeOverlay: vi.fn(),
    });

    vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(getSampleMetaMaskState());

    it("shows an NFT gallery card for the user", () => {
        const gallery = new GalleryDataFactory().withCoverImage().create();

        render(<NftGalleryCard gallery={gallery} />);

        expect(screen.getByTestId("NftGalleryCard")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryCoverImage")).toBeInTheDocument();
        expect(screen.queryByTestId("NftImageGrid")).not.toBeInTheDocument();
    });

    it("shows an NFT gallery card for the user when no cover image is set", () => {
        const gallery = new GalleryDataFactory().withoutCoverImage().create();

        render(<NftGalleryCard gallery={gallery} />);

        expect(screen.getByTestId("NftGalleryCard")).toBeInTheDocument();

        expect(screen.getByTestId("NftImageGrid")).toBeInTheDocument();
        expect(screen.queryByTestId("GalleryCoverImage")).not.toBeInTheDocument();
    });
});
