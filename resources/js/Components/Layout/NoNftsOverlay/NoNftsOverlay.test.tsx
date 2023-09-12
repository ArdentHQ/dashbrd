import React from "react";
import { NoNftsOverlay } from "@/Components/Layout/NoNftsOverlay";
import { render, screen } from "@/Tests/testing-library";

describe("NoNftsOverlay", () => {
    it("shows the overlay", () => {
        render(<NoNftsOverlay show={true} />);

        expect(screen.getByTestId("Overlay")).toBeInTheDocument();

        expect(screen.getByText(/You can purchase NFTs with these top NFT Marketplaces/)).toBeInTheDocument();
    });
});
