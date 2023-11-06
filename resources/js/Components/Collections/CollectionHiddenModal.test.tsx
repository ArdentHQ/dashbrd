import { router } from "@inertiajs/core";
import React from "react";
import { type SpyInstance } from "vitest";
import { CollectionHiddenModal } from "./CollectionHiddenModal";
import * as useDarkModeContext from "@/Contexts/DarkModeContext";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

const collection = new CollectionDetailDataFactory().create();

let useDarkModeContextSpy: SpyInstance;

describe("CollectionHiddenModal", () => {
    beforeAll(() => {
        useDarkModeContextSpy = vi
            .spyOn(useDarkModeContext, "useDarkModeContext")
            .mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });
    });

    afterAll(() => {
        useDarkModeContextSpy.mockRestore();
    });

    it("should render", () => {
        render(<CollectionHiddenModal collection={collection} />);

        expect(screen.getByTestId("CollectionHiddenModal__description")).toBeInTheDocument();
    });

    it("can be closed by moving back to the Collections page", async () => {
        const function_ = vi.fn();

        vi.spyOn(router, "get").mockImplementation(function_);

        render(<CollectionHiddenModal collection={collection} />);

        const closeButton = screen.getByTestId("ConfirmationDialog__close");

        await userEvent.click(closeButton);

        expect(function_).toHaveBeenCalled();
    });

    it("can be closed by moving back to the previous page, if one is specified", async () => {
        const function_ = vi.fn();

        vi.spyOn(router, "get").mockImplementation(function_);

        render(
            <CollectionHiddenModal
                previousUrl="some-dummy-url"
                collection={collection}
            />,
        );

        const closeButton = screen.getByTestId("ConfirmationDialog__close");

        await userEvent.click(closeButton);

        expect(function_).toHaveBeenCalledWith("some-dummy-url");
    });

    it("allows user to press the Unhide button to show the collection and closes the modal", async () => {
        const function_ = vi.fn((url, options) => {
            (options as { onSuccess: () => void; onError: () => void }).onSuccess();
        });

        vi.spyOn(router, "delete").mockImplementation(function_);

        render(<CollectionHiddenModal collection={collection} />);

        const submitButton = screen.getByTestId("ConfirmationDialog__confirm");

        await userEvent.click(submitButton);

        expect(function_).toHaveBeenCalled();

        expect(screen.queryByTestId("CollectionHiddenModal__description")).not.toBeInTheDocument();
    });

    it("can show an error message if something went wrong trying to show the collection", async () => {
        const function_ = vi.fn((url, options) => {
            (options as { onSuccess: () => void; onError: () => void }).onError();
        });

        vi.spyOn(router, "delete").mockImplementation(function_);

        render(<CollectionHiddenModal collection={collection} />);

        const submitButton = screen.getByTestId("ConfirmationDialog__confirm");

        await userEvent.click(submitButton);

        expect(screen.getByTestId("CollectionHiddenModal__error")).toBeInTheDocument();
    });
});
