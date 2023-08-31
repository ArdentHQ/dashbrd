import React from "react";
import { TokenActions } from "@/Components/Tokens/TokenActions";
import { render, screen, within } from "@/Tests/testing-library";

describe("UserDetailActions", () => {
    it("should render with default actions", () => {
        render(<TokenActions balance={"450"} />);

        expect(screen.getByTestId("TokenActions__send")).toBeInTheDocument();
        expect(screen.getByTestId("TokenActions__receive")).toBeInTheDocument();
    });

    it("should enable send button if balance > 0", () => {
        render(<TokenActions balance={"450"} />);

        const sendButton = within(screen.getByTestId("TokenActions__send")).getByTestId("IconButton");

        expect(sendButton).not.toBeDisabled();
    });

    it("should disable send button if balance is undefined or 0", () => {
        const { rerender } = render(<TokenActions />);

        let sendButton = within(screen.getByTestId("TokenActions__send")).getByTestId("IconButton");

        expect(sendButton).toBeDisabled();

        rerender(<TokenActions balance={"0"} />);

        sendButton = within(screen.getByTestId("TokenActions__send")).getByTestId("IconButton");
        expect(sendButton).toBeDisabled();
    });

    it("should handle onSend", () => {
        render(<TokenActions onSend={vi.fn()} />);

        const sendButton = within(screen.getByTestId("TokenActions__send")).getByTestId("IconButton");

        expect(sendButton).toBeDisabled();
    });
});
