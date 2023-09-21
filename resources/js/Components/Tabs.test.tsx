import React from "react";
import { Tabs } from "@/Components/Tabs";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Tabs", () => {
    it("should render tabs wrapper", () => {
        render(
            <Tabs>
                <span data-testid="test"></span>
            </Tabs>,
        );

        expect(screen.getByTestId("test")).toBeTruthy();

        expect(screen.getByTestId("test").parentElement?.className).toContain("bg-theme-secondary-100");
    });

    it("should render tab button", () => {
        render(
            <Tabs.Button>
                <span data-testid="test">Click Me</span>
            </Tabs.Button>,
        );

        expect(screen.getByTestId("test")).toBeTruthy();

        expect(screen.getByTestId("test").parentElement?.tagName).toBe("BUTTON");
    });

    it("should render tab icon button", () => {
        const { getByTestId } = render(<Tabs.Button icon="ArrowExternalSmall" />);

        expect(getByTestId("icon-ArrowExternalSmall")).toBeTruthy();

        expect(getByTestId("icon-ArrowExternalSmall").parentElement?.tagName).toBe("BUTTON");

        expect(getByTestId("icon-ArrowExternalSmall").parentElement?.className).toContain("w-10 h-10");
    });

    it("should render tab link", () => {
        render(
            <Tabs.Link href="https://ardenthq.com">
                <span data-testid="test">Click Me</span>
            </Tabs.Link>,
        );

        expect(screen.getByTestId("test")).toBeTruthy();

        expect(screen.getByTestId("test").parentElement?.tagName).toBe("A");

        expect(screen.getByTestId("test").parentElement?.getAttribute("href")).toBe("https://ardenthq.com");
    });

    it("has click event", async () => {
        const onClick = vi.fn();

        render(
            <Tabs.Button onClick={onClick}>
                <span data-testid="test">Click Me</span>
            </Tabs.Button>,
        );

        await userEvent.click(screen.getByTestId("test"));

        expect(onClick).toHaveBeenCalled();
    });

    it("marks button as selected", () => {
        render(
            <Tabs.Button selected>
                <span data-testid="test">Click Me</span>
            </Tabs.Button>,
        );

        expect(screen.getByTestId("test").parentElement?.className).toContain("text-theme-secondary-900");
    });

    it("marks button as disabled", () => {
        render(
            <Tabs.Button disabled>
                <span data-testid="test">Click Me</span>
            </Tabs.Button>,
        );

        expect(screen.getByTestId("test").parentElement?.className).toContain("cursor-not-allowed");
    });

    it("marks link as selected", () => {
        render(
            <Tabs.Link selected>
                <span data-testid="test">Click Me</span>
            </Tabs.Link>,
        );

        expect(screen.getByTestId("test").parentElement?.className).toContain("bg-theme-primary-100");
    });
    it("marks link as disabled", () => {
        render(
            <Tabs.Link disabled>
                <span data-testid="test">Click Me</span>
            </Tabs.Link>,
        );

        expect(screen.getByTestId("test").parentElement?.className).toContain("cursor-not-allowed");
    });
});
