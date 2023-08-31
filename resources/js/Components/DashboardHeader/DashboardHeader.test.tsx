import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { render, screen, within } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

describe("DashboardHeader", () => {
    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<DashboardHeader />, { breakpoint });

        expect(screen.getByTestId("DashboardHeader")).toBeInTheDocument();
    });

    it("should enable send button if balance > 0", () => {
        render(<DashboardHeader balance={450} />);

        const sendButton = within(screen.getByTestId("DashboardHeader__send")).getByTestId("Button");

        expect(sendButton).not.toBeDisabled();
    });

    it("should disable send button if balance is undefined or 0", () => {
        const { rerender } = render(<DashboardHeader />);

        let sendButton = within(screen.getByTestId("DashboardHeader__send")).getByTestId("Button");

        expect(sendButton).toBeDisabled();

        rerender(<DashboardHeader balance={0} />);

        sendButton = within(screen.getByTestId("DashboardHeader__send")).getByTestId("Button");
        expect(sendButton).toBeDisabled();
    });
});
