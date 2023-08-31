import React from "react";
import { expect } from "vitest";
import { Clipboard } from "./Clipboard";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

describe("Clipboard", () => {
    const text = "0x1234567890123456789012345678901234567890";

    it("should render screen", () => {
        render(<Clipboard text={text} />);

        expect(screen.getByTestId("Clipboard")).toBeInTheDocument();
    });

    it("should copy to clipboard", async () => {
        const copyMock = vi.spyOn(window.navigator.clipboard, "writeText").mockImplementation(async () => {
            await Promise.resolve();
        });

        render(<Clipboard text={text} />);

        await userEvent.click(screen.getByTestId("Clipboard"));

        await waitFor(() => {
            expect(copyMock).toHaveBeenCalledWith(text);
        });

        // Check if tooltip is hidden after 1 second
        await waitFor(
            () => {
                expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-0");
            },
            { timeout: 1000 },
        );
    });

    it("should show an icon when copied to clipboard", async () => {
        render(
            <Clipboard
                text={text}
                copiedIconClass="nice-text"
            />,
        );

        await userEvent.click(screen.getByTestId("Clipboard"));

        const copiedIcon = await screen.findByTestId("Clipboard__CopiedIcon");

        expect(copiedIcon).toBeInTheDocument();
        expect(copiedIcon).toHaveClass("nice-text");
    });

    it("should show a provided icon when copied to clipboard", async () => {
        render(
            <Clipboard
                text={text}
                copiedIcon={<i data-testid="Clipboard__CopiedIcon">Copied Icon</i>}
            />,
        );

        await userEvent.click(screen.getByTestId("Clipboard"));
        expect(await screen.findByTestId("Clipboard__CopiedIcon")).toBeInTheDocument();
    });

    it("should trigger on click on mobile", async () => {
        render(<Clipboard text={text} />, { breakpoint: Breakpoint.sm });

        await userEvent.click(screen.getByTestId("Clipboard"));
        expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-100");
        await waitFor(
            () => {
                expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-0");
            },
            { timeout: 1000 },
        );

        await userEvent.hover(screen.getByTestId("Clipboard"));
        expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-0");
    });

    it("should hide after 1 second on mobile", async () => {
        render(<Clipboard text={text} />, { breakpoint: Breakpoint.sm });

        await userEvent.click(screen.getByTestId("Clipboard"));
        expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-100");
        await waitFor(
            () => {
                expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-0");
            },
            { timeout: 1000 },
        );
    });

    it("should not hide after 1 second on desktop", async () => {
        render(<Clipboard text={text} />, { breakpoint: Breakpoint.lg });

        await userEvent.click(screen.getByTestId("Clipboard"));
        expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-100");
        await waitFor(
            () => {
                expect(screen.getByTestId("Clipboard__CopiedIconContainer")).toHaveClass("opacity-100");
            },
            { timeout: 1000 },
        );
    });
});
