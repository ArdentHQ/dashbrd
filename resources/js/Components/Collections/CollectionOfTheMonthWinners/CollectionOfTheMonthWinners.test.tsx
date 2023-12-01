import React from "react";
import { CollectionOfTheMonthWinners } from "./CollectionOfTheMonthWinners";
import * as useDarkModeContext from "@/Contexts/DarkModeContext";
import CollectionOfTheMonthFactory from "@/Tests/Factories/Collections/CollectionOfTheMonthFactory";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionOfTheMonthWinners", () => {
    it("should render without winners", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={[]} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it("should render without winners in dark mode", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={[]} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render with %s winners", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={collections} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render with %s winners in dark mode", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={collections} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });
});
