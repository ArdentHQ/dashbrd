import React from "react";
import { ListboxButton, ListboxButtonIcon } from "./Listbox.blocks";
import { Listbox } from "@/Components/Form/Listbox";
import { Icon } from "@/Components/Icon";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Listbox", () => {
    it("should select option", async () => {
        render(
            <Listbox value="value">
                <Listbox.Option
                    key={1}
                    value="value"
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        expect(screen.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxOption")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("option"));

        expect(screen.queryByTestId("ListboxOption")).not.toBeInTheDocument();
    });

    it("should render option with icon", async () => {
        render(
            <Listbox value="value">
                <Listbox.Option
                    icon={<Icon name="ArrowUp" />}
                    key={1}
                    value="value"
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        expect(screen.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxOption")).toBeInTheDocument();
        expect(screen.getByTestId("ListboxOption__icon")).toBeInTheDocument();
    });

    it("should render a disabled option with icon", async () => {
        render(
            <Listbox value="value">
                <Listbox.Option
                    icon={<Icon name="ArrowUp" />}
                    key={1}
                    value="value"
                    isDisabled
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        expect(screen.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxOption")).toBeInTheDocument();
        expect(screen.getByTestId("ListboxOption__icon")).toBeInTheDocument();
    });

    it("should render an option with different styles if isSelected is true", async () => {
        render(
            <Listbox value="value">
                <Listbox.Option
                    icon={<Icon name="ArrowUp" />}
                    key={1}
                    value="value"
                    isSelected
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        expect(screen.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxOption")).toHaveClass("bg-theme-hint-100");
    });
});

describe("ListboxButton", () => {
    it("should render", async () => {
        render(
            <Listbox>
                <ListboxButton maxWidth={100} />
            </Listbox>,
        );

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxButton")).toBeInTheDocument();
    });

    it("should render button with children", async () => {
        render(
            <Listbox>
                <ListboxButton>
                    <div data-testid="button">button</div>
                </ListboxButton>
            </Listbox>,
        );

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("button")).toBeInTheDocument();
    });

    it("should render errored button", async () => {
        render(
            <Listbox>
                <ListboxButton hasError />
            </Listbox>,
        );

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxButton")).toBeInTheDocument();
        expect(screen.getByTestId("ListboxButton")).toHaveClass("border-theme-danger-400 ring-1 ring-theme-danger-400");
    });

    it("should render button placeholder", async () => {
        render(
            <Listbox>
                <ListboxButton placeholder="placeholder" />
            </Listbox>,
        );

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxButton")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ListboxButton"));

        expect(screen.getByTestId("ListboxButtonPlaceholder")).toBeInTheDocument();
    });

    it("should render button icon", () => {
        render(<ListboxButtonIcon />);

        expect(screen.getByTestId("ListboxButtonIcon")).toBeInTheDocument();
    });

    it("should render button icon as disabled", () => {
        render(<ListboxButtonIcon isDisabled />);

        expect(screen.getByTestId("ListboxButtonIcon")).toHaveClass("text-theme-secondary-500");
    });
});

describe("ListboxOption", () => {
    it("should render with custom className for icon", async () => {
        render(
            <Listbox>
                <Listbox.Option
                    as={React.Fragment}
                    icon={<Icon name="ArrowUp" />}
                    key={1}
                    value="value"
                    classNames={{ icon: "test-class" }}
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        await userEvent.click(screen.getByTestId("Listbox__trigger"));
        expect(screen.getByTestId("ListboxOption__icon")).toHaveClass("test-class");
    });

    it("should render with custom className for option", async () => {
        render(
            <Listbox>
                <Listbox.Option
                    as={React.Fragment}
                    icon={<Icon name="ArrowUp" />}
                    key={1}
                    value="value"
                    classNames={{ option: "test-class" }}
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        await userEvent.click(screen.getByTestId("Listbox__trigger"));
        expect(screen.getByTestId("ListboxOption")).toHaveClass("test-class");
    });
});
