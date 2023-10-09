import React from "react";
import { NoNftsOverlay } from "@/Components/Layout/NoNftsOverlay";
import { render, screen } from "@/Tests/testing-library";
import * as useDarkModeContext from "@/Contexts/DarkModeContex";

describe("NoNftsOverlay", () => {
    beforeAll(() => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("shows the overlay", () => {
        render(<NoNftsOverlay show={true} />);

        expect(screen.getByTestId("Overlay")).toBeInTheDocument();

        expect(screen.getByText(/You can purchase NFTs with these top NFT Marketplaces/)).toBeInTheDocument();
    });
});
