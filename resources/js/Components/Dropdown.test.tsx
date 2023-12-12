import React from "react";
import { Dropdown } from "./Dropdown";
import { act, render, screen, userEvent, waitFor } from "@/Tests/testing-library";

const dropdownWrapper = (): HTMLElement => screen.getByTestId("Dropdown__content-wrapper");

describe("Dropdown", () => {
    it("should open and close dropdown", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        await waitFor(() => {
            expect(screen.queryByTestId("content")).not.toBeInTheDocument();
        });
    });

    it("should render with callback", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">{() => <div data-testid="content"></div>}</Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should pass a setOpen method to the callback", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    {({ setOpen }) => (
                        <div data-testid="content">
                            <button
                                data-testid="close-button"
                                onClick={() => {
                                    setOpen(false);
                                }}
                            >
                                Close Me
                            </button>
                        </div>
                    )}
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("close-button"));

        await waitFor(() => {
            expect(screen.queryByTestId("content")).not.toBeInTheDocument();
        });
    });

    it("should open and close dropdown when clicking outside", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        await userEvent.click(document.body);

        await waitFor(() => {
            expect(screen.queryByTestId("content")).not.toBeInTheDocument();
        });
    });

    it("should open and close dropdown when blur outside", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const event = new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body });

        act(() => {
            screen.getByTestId("trigger").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(screen.queryByTestId("content")).not.toBeInTheDocument();
        });
    });

    it("should position the dropdown initially when uses popper", async () => {
        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content>
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        await userEvent.click(screen.getByTestId("trigger"));

        // Shown initially so can be positioned with popper
        expect(dropdownWrapper()).toBeInTheDocument();
        expect(dropdownWrapper()).toHaveClass("pointer-events-none");

        // Then shown as usual
        await waitFor(() => {
            expect(dropdownWrapper()).not.toHaveClass("pointer-events-none");
        });
    });

    it("should close dropdown when blur dropdown outside when using popper", async () => {
        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const event = new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body });

        act(() => {
            screen.getByTestId("content").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(screen.queryByTestId("content")).not.toBeInTheDocument();
        });
    });

    it("should not close dropdown when blur trigger to a child in the drodpown when using portal", async () => {
        render(
            <Dropdown
                withPortal
                withPopper
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content">
                        <button data-testid="button">Button</button>
                    </div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const element = screen.getByTestId("button");

        const event = new FocusEvent("focusout", {
            bubbles: true,
            relatedTarget: element,
        });

        // see if relatedTarget is a child of the dropdown
        const eventSpy = vi
            .spyOn(event, "relatedTarget", "get")
            // First time I return the body to ensure its treated as outside inside
            // the `useOnBlurOutside`
            .mockReturnValueOnce(document.body)
            // Second time I return the button element
            .mockReturnValue(element);

        act(() => {
            screen.getByTestId("trigger").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(eventSpy).toHaveBeenCalledTimes(2);
        });

        // Not closed
        await waitFor(() => {
            expect(screen.getByTestId("content")).toBeInTheDocument();
        });
    });

    it("should close dropdown when clicked outside when using popper", async () => {
        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        await userEvent.click(document.body);

        await waitFor(() => {
            expect(screen.queryByTestId("content")).not.toBeInTheDocument();
        });
    });

    it("should not close dropdown when clicking on a child in the drodpown when using portal", async () => {
        render(
            <Dropdown
                withPortal
                withPopper
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content">
                        <button data-testid="button">Button</button>
                    </div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("button"));

        // Not closed
        await waitFor(() => {
            expect(screen.getByTestId("content")).toBeInTheDocument();
        });
    });

    it("should focus dropdown focusable element when using portal", async () => {
        render(
            <Dropdown
                withPortal
                withPopper
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content">
                        <button data-testid="button">Button</button>
                    </div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const button = screen.getByTestId("button");

        const event = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab",
            shiftKey: false,
        });

        act(() => {
            screen.getByTestId("trigger").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(button).toHaveFocus();
        });
    });

    it("should focus next element as usual if no focusable elements in the dropdown when using popper", async () => {
        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const event = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab",
            shiftKey: false,
        });

        act(() => {
            screen.getByTestId("trigger").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(document.body).toHaveFocus();
        });
    });

    it("should focus next element as usual if press shift key in the dropdown when using popper", async () => {
        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const event = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab",
            shiftKey: true,
        });

        act(() => {
            screen.getByTestId("trigger").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(document.body).toHaveFocus();
        });
    });

    it("should focus next element as usual if no using popper", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content">
                        <button data-testid="button">Button</button>
                    </div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const event = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab",
            shiftKey: false,
        });

        act(() => {
            screen.getByTestId("trigger").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(document.body).toHaveFocus();
        });
    });

    it("should focus next element inside the dropdown", async () => {
        const focusHandler = vi.fn();

        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content">
                        <button data-testid="button">Button</button>
                        <button onFocus={focusHandler}>Button</button>
                    </div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const button = screen.getByTestId("button");

        act(() => {
            button.focus();
        });

        expect(focusHandler).not.toHaveBeenCalled();

        await userEvent.tab();

        expect(focusHandler).toHaveBeenCalled();
    });

    it("should focus prev element inside the dropdown", async () => {
        const focusHandler = vi.fn();

        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content">
                        <button onFocus={focusHandler}>Button</button>
                        <button data-testid="button2">Button</button>
                    </div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const button2 = screen.getByTestId("button2");

        act(() => {
            button2.focus();
        });

        expect(focusHandler).not.toHaveBeenCalled();

        await userEvent.tab({
            shift: true,
        });

        expect(focusHandler).toHaveBeenCalled();
    });

    it("should focus next element relative to the trigger if no more elements in the dropdown", async () => {
        render(
            <div>
                <Dropdown
                    withPopper
                    withPortal
                >
                    <Dropdown.Trigger className="relative z-50 flex">
                        {() => <button data-testid="trigger"></button>}
                    </Dropdown.Trigger>

                    <Dropdown.Content align="none">
                        <div data-testid="content"></div>
                    </Dropdown.Content>
                </Dropdown>

                <input data-testid="focusable" />
            </div>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const focusable = screen.getByTestId("focusable");

        const event = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab",
            shiftKey: false,
        });

        act(() => {
            screen.getByTestId("content").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(focusable).toHaveFocus();
        });
    });

    it("should focus next element normally if trigger is not focusable", async () => {
        render(
            <div>
                <Dropdown
                    withPopper
                    withPortal
                >
                    <Dropdown.Trigger className="relative z-50 flex">
                        {() => <div data-testid="trigger"></div>}
                    </Dropdown.Trigger>

                    <Dropdown.Content align="none">
                        <div data-testid="content"></div>
                    </Dropdown.Content>
                </Dropdown>

                <input data-testid="focusable" />
            </div>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const event = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab",
            shiftKey: false,
        });

        act(() => {
            screen.getByTestId("content").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(document.body).toHaveFocus();
        });
    });

    it("should focus trigger if tabbing forwared and no more elements in the dropdown", async () => {
        render(
            <div>
                <input data-testid="focusable" />

                <Dropdown
                    withPopper
                    withPortal
                >
                    <Dropdown.Trigger className="relative z-50 flex">
                        {() => <button data-testid="trigger"></button>}
                    </Dropdown.Trigger>

                    <Dropdown.Content align="none">
                        <div data-testid="content"></div>
                    </Dropdown.Content>
                </Dropdown>
            </div>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();

        const event = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Tab",
            shiftKey: true,
        });

        act(() => {
            screen.getByTestId("content").dispatchEvent(event);
        });

        await waitFor(() => {
            expect(screen.getByTestId("trigger")).toHaveFocus();
        });
    });

    it("should position the dropdown again when window is resized", async () => {
        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content>
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        await userEvent.click(screen.getByTestId("trigger"));

        // Shown initially so can be positioned with popper
        expect(dropdownWrapper()).toBeInTheDocument();
        expect(dropdownWrapper()).toHaveClass("pointer-events-none");

        // Then shown as usual
        await waitFor(() => {
            expect(dropdownWrapper()).not.toHaveClass("pointer-events-none");
        });

        // Close the dropdown
        await userEvent.click(screen.getByTestId("trigger"));

        await waitFor(() => {
            expect(screen.queryByTestId("Dropdown__content-wrapper")).not.toBeInTheDocument();
        });

        // Second time should not be positioned
        await userEvent.click(screen.getByTestId("trigger"));

        expect(dropdownWrapper()).toBeInTheDocument();

        // Means it's not positioned
        expect(dropdownWrapper()).not.toHaveClass("pointer-events-none");

        // Close the dropdown
        await userEvent.click(screen.getByTestId("trigger"));

        await waitFor(() => {
            expect(screen.queryByTestId("Dropdown__content-wrapper")).not.toBeInTheDocument();
        });

        // trigger window resize event so need repositioning
        act(() => {
            window.dispatchEvent(new Event("resize"));
        });

        // Third time should be positioned since window was resized
        await userEvent.click(screen.getByTestId("trigger"));

        expect(dropdownWrapper()).toBeInTheDocument();

        expect(dropdownWrapper()).toHaveClass("pointer-events-none");
    });

    it("should not close the dropdown when clicking on content", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(dropdownWrapper()).toBeInTheDocument();

        await userEvent.click(dropdownWrapper());

        expect(screen.queryByTestId("content")).toBeInTheDocument();
    });

    it("should not close the dropdown when clicking on content when using portal", async () => {
        render(
            <Dropdown
                withPopper
                withPortal
            >
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="none">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(dropdownWrapper()).toBeInTheDocument();

        await userEvent.click(dropdownWrapper());

        expect(screen.queryByTestId("content")).toBeInTheDocument();
    });

    it("should align content on the right", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="right">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();
        expect(dropdownWrapper()).toHaveClass("right-0");
    });

    it("should align content on the left", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content align="left">
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();
        expect(dropdownWrapper()).toHaveClass("left-0");
    });

    it("should align content on the left by default", async () => {
        render(
            <Dropdown>
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>

                <Dropdown.Content>
                    <div data-testid="content"></div>
                </Dropdown.Content>
            </Dropdown>,
        );

        expect(screen.queryByTestId("content")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("trigger"));

        expect(screen.getByTestId("content")).toBeInTheDocument();
        expect(dropdownWrapper()).toHaveClass("left-0");
    });

    it("should open and close dropdown", () => {
        const href = "/test";
        render(<Dropdown.Link href={href}>test</Dropdown.Link>);

        expect(screen.getByTestId("DropdownLink")).toBeInTheDocument();
        expect(screen.getByTestId("DropdownLink")).toHaveAttribute("href", href);
    });

    it("should error if trigger is rendered outside of dropdown context", () => {
        const function_ = vi.fn();
        const errorLogMock = vi.spyOn(console, "error").mockImplementation(function_);

        expect(() =>
            render(
                <Dropdown.Trigger className="relative z-50 flex">
                    {() => <div data-testid="trigger"></div>}
                </Dropdown.Trigger>,
            ),
        ).toThrowError("useDropdownContext must be within DropDownContext.Provider");

        errorLogMock.mockRestore();
    });
});
