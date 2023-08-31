import React from "react";
import { Avatar } from "@/Components/Avatar";
import { TextInput } from "@/Components/Form/TextInput";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("TextInput", () => {
    it("should render", () => {
        render(<TextInput />);

        expect(screen.getByTestId("TextInput")).toBeInTheDocument();
    });

    it("should render as text by default", () => {
        render(<TextInput />);

        expect(screen.getByTestId("TextInput")).toBeInTheDocument();
        expect(screen.getByTestId("TextInput__input")).toHaveAttribute("type", "text");
    });

    it("should render as input type", () => {
        render(<TextInput type="input" />);

        expect(screen.getByTestId("TextInput")).toBeInTheDocument();
        expect(screen.getByTestId("TextInput__input")).toHaveAttribute("type", "input");
    });

    it("should render as focused", () => {
        render(<TextInput isFocused />);

        expect(screen.getByTestId("TextInput")).toBeInTheDocument();
        expect(screen.getByTestId("TextInput__input")).toHaveFocus();
    });

    it("should render error state", () => {
        render(<TextInput hasError />);

        expect(screen.getByTestId("TextInput")).toHaveClass("border-theme-danger-400 ring-1 ring-theme-danger-400");
    });

    it("should render disabled state", () => {
        render(<TextInput disabled />);

        expect(screen.getByTestId("TextInput")).toHaveClass("bg-theme-secondary-50");
        expect(screen.getByTestId("TextInput__input")).toBeDisabled();
    });

    it("should handle focus event", async () => {
        const onFocusMock = vi.fn();
        render(<TextInput onFocus={onFocusMock} />);

        expect(screen.getByTestId("TextInput")).toBeInTheDocument();

        await userEvent.type(screen.getByTestId("TextInput__input"), "test");

        expect(screen.getByTestId("TextInput__input")).toHaveFocus();
        expect(onFocusMock).toHaveBeenCalled();

        onFocusMock.mockRestore();
    });

    it("should handle blur event", async () => {
        const onBlurMock = vi.fn();
        render(<TextInput onBlur={onBlurMock} />);

        expect(screen.getByTestId("TextInput")).toBeInTheDocument();

        await userEvent.type(screen.getByTestId("TextInput__input"), "test");

        expect(screen.getByTestId("TextInput__input")).toHaveFocus();

        await userEvent.click(screen.getByTestId("TextInput"));

        expect(screen.getByTestId("TextInput__input")).not.toHaveFocus();
        expect(onBlurMock).toHaveBeenCalled();
    });

    it("should handle hover event", async () => {
        render(<TextInput />);

        expect(screen.getByTestId("TextInput")).toBeInTheDocument();

        await userEvent.hover(screen.getByTestId("TextInput"));

        expect(screen.getByTestId("TextInput")).toHaveClass("ring-2 ring-theme-hint-100");
    });

    it("should render text input avatar", () => {
        render(<TextInput.Avatar />);

        expect(screen.getByTestId("TextInput__avatar")).toBeInTheDocument();
    });

    it("should render text input button", () => {
        render(<TextInput.Button />);

        expect(screen.getByTestId("TextInput__button")).toBeInTheDocument();
    });

    it("should not add hover classes to wrapper element if a child is hovered", async () => {
        render(
            <TextInput
                before={
                    <TextInput.Avatar>
                        <Avatar
                            address="0x1"
                            size={32}
                        />
                    </TextInput.Avatar>
                }
                after={<TextInput.Button>Max</TextInput.Button>}
            />,
        );

        expect(screen.getByTestId("TextInput__button")).toBeInTheDocument();
        expect(screen.getByTestId("TextInput__avatar")).toBeInTheDocument();

        await userEvent.hover(screen.getByTestId("TextInput__button"));

        expect(screen.getByTestId("TextInput")).not.toHaveClass("ring-2 ring-theme-hint-100");
    });
});
