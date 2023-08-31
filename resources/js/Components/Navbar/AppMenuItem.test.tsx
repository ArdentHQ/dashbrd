import React from "react";
import { AppMenuItem } from "@/Components/Navbar/AppMenuItem";
import { render, screen } from "@/Tests/testing-library";

describe("AppMenuItem", () => {
    it("should render", () => {
        render(<AppMenuItem title="title" />);

        expect(screen.getByTestId("AppMenuItem")).toBeInTheDocument();
    });

    it("should render disabled", () => {
        render(
            <AppMenuItem
                disabled
                title="title"
            />,
        );

        expect(screen.getByTestId("AppMenuItem__disabled")).toHaveClass("cursor-default");
    });

    it("should render with url", () => {
        const url = "/test";

        render(
            <AppMenuItem
                title="title"
                url={url}
            />,
        );

        expect(screen.getByTestId("AppMenuItem")).toBeInTheDocument();
        expect(screen.getByTestId("AppMenuItem")).toHaveAttribute("href", url);
    });

    it.each([
        [true, false, "text-theme-secondary-900"],
        [false, false, "text-theme-secondary-700"],
        [false, true, "text-theme-secondary-500"],
    ])("should render item title with the given color", (isActive, disabled, className) => {
        render(
            <AppMenuItem
                title="title"
                isActive={isActive}
                disabled={disabled}
                url="/test"
            />,
        );

        expect(screen.getByTestId("AppMenuItem__Title")).toHaveClass(className);
    });

    it("should render with light theme by default", () => {
        render(<AppMenuItem title="title" />);

        expect(screen.getByTestId("AppMenuItem")).toHaveClass("border-transparent");
    });

    it("should render with dark theme", () => {
        render(
            <AppMenuItem
                title="title"
                dark
            />,
        );

        expect(screen.getByTestId("AppMenuItem")).toHaveClass("border-transparent");
    });

    it("should render with custom class names", () => {
        render(
            <AppMenuItem
                title="title"
                className="test-class"
            />,
        );

        expect(screen.getByTestId("AppMenuItem")).toHaveClass("test-class");
    });

    it("should render an inertia link by default", () => {
        render(<AppMenuItem title="title" />);

        expect(screen.queryByTestId("Link__anchor")).not.toBeInTheDocument();
    });

    it("should render an anchor if useAnchorTag is set", () => {
        render(
            <AppMenuItem
                title="title"
                useAnchorTag
            />,
        );

        expect(screen.getByTestId("Link__anchor")).toBeInTheDocument();
    });
});
