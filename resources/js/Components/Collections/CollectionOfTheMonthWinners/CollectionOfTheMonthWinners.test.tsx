import React from "react";
import { CollectionOfTheMonthWinners } from "./CollectionOfTheMonthWinners";
import { WinnersChart } from "./CollectionOfTheMonthWinners.blocks";
import * as useDarkModeContext from "@/Contexts/DarkModeContext";
import CollectionOfTheMonthFactory from "@/Tests/Factories/Collections/CollectionOfTheMonthFactory";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionOfTheMonthWinners", () => {
    it("should render without winners", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={{ winners: [], year: 2023, month: 1 }} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it("should render without winners in dark mode", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={{ winners: [], year: 2023, month: 1 }} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render with %s winners", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={{ winners: collections, year: 2023, month: 2 }} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render with %s winners in dark mode", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(<CollectionOfTheMonthWinners winners={{ winners: collections, year: 2023, month: 2 }} />);

        expect(screen.getByTestId("CollectionOfTheMonthWinners")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });
});

describe("WinnersChart", () => {
    it("should render without winners", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(
            <WinnersChart
                winners={{
                    year: 2023,
                    month: 1,
                    winners: [],
                }}
            />,
        );

        expect(screen.queryByTestId("WinnersChart")).not.toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it("should render without winners in dark mode", () => {
        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(
            <WinnersChart
                winners={{
                    year: 2023,
                    month: 1,
                    winners: [],
                }}
            />,
        );

        expect(screen.queryByTestId("WinnersChart")).not.toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render with %s winners", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(<WinnersChart winners={{ winners: collections, year: 2023, month: 2 }} />);

        expect(screen.getByTestId("WinnersChart")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render with %s winners in dark mode", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(<WinnersChart winners={{ winners: collections, year: 2023, month: 2 }} />);

        expect(screen.getByTestId("WinnersChart")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render large version with %s winners", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        render(
            <WinnersChart
                winners={{ winners: collections, year: 2023, month: 2 }}
                large
            />,
        );

        expect(screen.getByTestId("WinnersChart")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });

    it.each([1, 2, 3])("should render large version with %s winners in dark mode", (amount) => {
        const collections = new CollectionOfTheMonthFactory().createMany(amount);

        const useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        render(
            <WinnersChart
                winners={{ winners: collections, year: 2023, month: 2 }}
                large
            />,
        );

        expect(screen.getByTestId("WinnersChart")).toBeInTheDocument();

        useDarkModeContextSpy.mockRestore();
    });
});
