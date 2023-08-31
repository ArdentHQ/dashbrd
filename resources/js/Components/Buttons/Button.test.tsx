import React from "react";
import { Button, type ButtonContentProperties } from "@/Components/Buttons/Button";
import { Icon } from "@/Components/Icon";
import { render, screen } from "@/Tests/testing-library";

describe("Button", () => {
    it("should render", () => {
        render(
            <Button>
                <span data-testid="test"></span>
            </Button>,
        );

        expect(screen.getByRole("button")).toBeTruthy();

        expect(screen.getByTestId("test")).toBeTruthy();
    });

    it.each(["primary", "secondary", "icon", "icon-primary", "icon-secondary"])(
        "should handle different variants",
        (variant) => {
            render(
                <Button variant={variant as "primary" | "secondary" | "icon" | "icon-primary" | "icon-secondary"}>
                    Press me
                </Button>,
            );

            expect(screen.getByRole("button")).toHaveClass(`button-${variant}`);
        },
    );

    it("adds an icon", () => {
        render(<Button icon="Metamask">Press me</Button>);

        expect(screen.getByTestId("icon-Metamask")).toBeInTheDocument();

        expect(screen.getByRole("button")).toHaveClass("button-with-icon");
    });
    it("adds an icon on the right", () => {
        render(
            <Button
                icon="ArrowUp"
                iconPosition="right"
            >
                Press me
            </Button>,
        );

        expect(screen.getByTestId("icon-ArrowUp")).toBeInTheDocument();

        // Check that the left sibling is a div with the text
        expect(screen.getByTestId("icon-ArrowUp").previousElementSibling).toHaveTextContent("Press me");
    });

    it("pass the icon as unique children if no text passed", () => {
        render(<Button icon="Heart" />);

        expect(screen.getByTestId("icon-Heart")).toBeInTheDocument();

        expect(screen.getByRole("button")).not.toHaveClass("button-with-icon");

        expect(screen.getByRole("button").children).toHaveLength(1);
    });

    it("adds a icon as jsx element", () => {
        const icon = <Icon name="Diamond" />;

        render(<Button icon={icon}>Press me</Button>);

        expect(screen.getByTestId("icon-Diamond")).toBeInTheDocument();

        expect(screen.getByRole("button")).toHaveClass("button-with-icon");
    });

    it("adds opacity is processing", () => {
        render(<Button processing>Press me</Button>);

        expect(screen.getByRole("button")).toHaveClass("opacity-25");
    });

    it("should render icon in sm size by default", () => {
        render(<Button icon="ArrowUp" />);

        expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-4 w-4");
    });

    it.each(["xs", "md"] as Array<ButtonContentProperties["iconSize"]>)(
        "should render icon in custom sizes",
        (size) => {
            render(
                <Button
                    icon="ArrowUp"
                    iconSize={size}
                />,
            );

            if (size === "xs") {
                expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-3 w-3");
            }

            if (size === "md") {
                expect(screen.getByTestId("icon-ArrowUp")).toHaveClass("h-5 w-5");
            }
        },
    );
});
