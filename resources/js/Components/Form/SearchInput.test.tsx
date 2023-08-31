import React from "react";
import { SearchInput } from "./SearchInput";
import { render, userEvent } from "@/Tests/testing-library";

describe("SearchInput", () => {
    it("should render a search input with a placeholder", () => {
        const function_ = vi.fn();

        const { getByPlaceholderText } = render(
            <SearchInput
                query=""
                onChange={function_}
                placeholder="Search"
            />,
        );
        const input = getByPlaceholderText("Search");
        expect(input).toBeInTheDocument();
    });

    it("should render a search input disabled", () => {
        const function_ = vi.fn();

        const { getByTestId } = render(
            <SearchInput
                query=""
                onChange={function_}
                placeholder="Search"
                disabled
            />,
        );
        const input = getByTestId("NftCollectionSlider__search");
        expect(input).toBeInTheDocument();
        expect(input).toBeDisabled();

        expect(getByTestId("icon-MagnifyingGlass")).toBeInTheDocument();
        expect(getByTestId("icon-MagnifyingGlass")).toHaveClass("text-theme-secondary-500");
    });

    it("should call onChange callback when input value changes", async () => {
        const onChangeMock = vi.fn();
        const { getByTestId } = render(
            <SearchInput
                query=""
                onChange={onChangeMock}
                placeholder="Search"
            />,
        );
        const input = getByTestId("NftCollectionSlider__search");

        await userEvent.type(input, "t");

        expect(onChangeMock).toHaveBeenCalledWith("t");
    });

    it("should render a clear button when query is not empty", () => {
        const function_ = vi.fn();

        const { getByTestId } = render(
            <SearchInput
                query="test"
                onChange={function_}
                placeholder="Search"
            />,
        );
        const clearButton = getByTestId("NftCollectionSlider__clear-search");
        expect(clearButton).toBeInTheDocument();
    });

    it("should clear query when clear button is clicked", async () => {
        const onChangeMock = vi.fn();
        const { getByTestId } = render(
            <SearchInput
                query="test"
                onChange={onChangeMock}
                placeholder="Search"
            />,
        );
        const clearButton = getByTestId("NftCollectionSlider__clear-search");

        await userEvent.click(clearButton);

        expect(onChangeMock).toHaveBeenCalledWith("");
    });

    it("should render with additional class names", () => {
        const function_ = vi.fn();

        const { getByTestId } = render(
            <SearchInput
                query=""
                onChange={function_}
                placeholder="Search"
                data-testid="SearchInput"
                className="custom-class"
            />,
        );
        const inputWrapper = getByTestId("SearchInput");
        expect(inputWrapper).toHaveClass("custom-class");
    });
});
