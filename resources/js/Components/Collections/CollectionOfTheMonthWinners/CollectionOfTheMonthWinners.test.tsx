import React from "react";
import { CollectionOfTheMonthWinners } from "./CollectionOfTheMonthWinners";
import * as useDarkModeContext from "@/Contexts/DarkModeContext";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionOfTheMonthWinners", () => {
    it("should render", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it("should render in dark mode", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });
});
