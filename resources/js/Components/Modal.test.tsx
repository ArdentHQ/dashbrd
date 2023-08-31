import React from "react";
import { Modal } from "@/Components/Modal";
import { render, screen } from "@/Tests/testing-library";

describe("Modal", () => {
    it("should render", () => {
        const reference = {
            current: document.createElement("div"),
        };

        render(
            <Modal
                show
                onClose={vi.fn()}
                initialFocus={reference}
            >
                <span data-testid="test"></span>
            </Modal>,
        );

        expect(screen.getByTestId("test")).toBeInTheDocument();
    });

    it("should render closed", () => {
        render(
            <Modal onClose={vi.fn()}>
                <span data-testid="test"></span>
            </Modal>,
        );

        expect(screen.queryByTestId("test")).not.toBeInTheDocument();
    });
});
