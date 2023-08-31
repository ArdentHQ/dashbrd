import { router } from "@inertiajs/react";
import React from "react";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Icon } from "@/Components/Icon";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("ButtonLink", () => {
    it("should render", () => {
        render(
            <ButtonLink href="test">
                <span data-testid="test"></span>
            </ButtonLink>,
        );

        expect(screen.getByTestId("ButtonLink")).toBeTruthy();

        expect(screen.getByTestId("ButtonLink")).toHaveAttribute("href", "test");

        expect(screen.getByTestId("test")).toBeTruthy();
    });

    it("should render as external if starts with http", () => {
        render(
            <ButtonLink href="http://www.ardenthq.com/">
                <span data-testid="test"></span>
            </ButtonLink>,
        );

        expect(screen.getByTestId("ButtonLink--anchor")).toBeTruthy();

        expect(screen.getByTestId("ButtonLink--anchor")).toHaveAttribute("href", "http://www.ardenthq.com/");

        expect(screen.getByTestId("test")).toBeTruthy();
    });

    it("should render as external if target is passed", () => {
        render(
            <ButtonLink
                href="test"
                target="_blank"
            >
                <span data-testid="test"></span>
            </ButtonLink>,
        );

        expect(screen.getByTestId("ButtonLink--anchor")).toBeTruthy();

        expect(screen.getByTestId("ButtonLink--anchor")).toHaveAttribute("href", "test");

        expect(screen.getByTestId("test")).toBeTruthy();
    });

    it.each(["primary", "secondary", "icon", "icon-primary", "icon-secondary"])(
        "should handle different variants",
        (variant) => {
            render(
                <ButtonLink
                    href="test"
                    variant={variant as "primary" | "secondary" | "icon" | "icon-primary" | "icon-secondary"}
                >
                    Click Me
                </ButtonLink>,
            );

            expect(screen.getByTestId("ButtonLink")).toHaveClass(`button-${variant}`);
        },
    );

    it("adds an icon", () => {
        render(
            <ButtonLink
                href="test"
                icon="Metamask"
            >
                Click Me
            </ButtonLink>,
        );

        expect(screen.getByTestId("icon-Metamask")).toBeInTheDocument();

        expect(screen.getByTestId("ButtonLink")).toHaveClass("button-with-icon");
    });

    it("adds an icon on the right", () => {
        render(
            <ButtonLink
                href="test"
                icon="ArrowUp"
                iconPosition="right"
            >
                Click Me
            </ButtonLink>,
        );

        expect(screen.getByTestId("icon-ArrowUp")).toBeInTheDocument();

        // Check that the left sibling is a div with the text
        expect(screen.getByTestId("icon-ArrowUp").previousElementSibling).toHaveTextContent("Click Me");
    });

    it("pass the icon as unique children if no text passed", () => {
        render(
            <ButtonLink
                href="test"
                icon="Heart"
            />,
        );

        expect(screen.getByTestId("icon-Heart")).toBeInTheDocument();

        expect(screen.getByTestId("ButtonLink")).not.toHaveClass("button-with-icon");

        expect(screen.getByTestId("ButtonLink").children).toHaveLength(1);
    });

    it("adds a icon as jsx element", () => {
        const icon = <Icon name="Diamond" />;

        render(
            <ButtonLink
                href="test"
                icon={icon}
            >
                Click Me
            </ButtonLink>,
        );

        expect(screen.getByTestId("icon-Diamond")).toBeInTheDocument();

        expect(screen.getByTestId("ButtonLink")).toHaveClass("button-with-icon");
    });

    it("adds opacity is processing", () => {
        render(
            <ButtonLink
                href="test"
                processing
            >
                Click Me
            </ButtonLink>,
        );

        expect(screen.getByTestId("ButtonLink")).toHaveClass("opacity-25");
    });

    it("should handle a disabled button", async () => {
        render(
            <ButtonLink
                href="/my-galleries/create"
                disabled
            >
                Click Me
            </ButtonLink>,
        );

        expect(screen.getByTestId("ButtonLink")).toBeInTheDocument();
        expect(screen.getByTestId("ButtonLink")).toHaveAttribute("disabled");

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        await userEvent.click(screen.getByTestId("ButtonLink"));

        expect(routerSpy).toBeCalledTimes(0);
    });

    it("should handle a non-disabled button", async () => {
        render(<ButtonLink href={`/my-galleries/create`}>Click Me</ButtonLink>);

        expect(screen.getByTestId("ButtonLink")).toBeInTheDocument();

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        await userEvent.click(screen.getByTestId("ButtonLink"));

        expect(routerSpy).toBeCalledTimes(1);
    });
});
