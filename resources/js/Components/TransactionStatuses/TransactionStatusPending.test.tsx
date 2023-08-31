import { t } from "i18next";
import { TransactionStatusPending } from "./TransactionStatusPending";
import { render, screen } from "@/Tests/testing-library";

describe("TransactionStatusPending", () => {
    it("should render", () => {
        render(<TransactionStatusPending />);

        expect(screen.getByTestId("TransactionStatus__Pending")).toBeInTheDocument();
    });

    it("should display pending confirmation message", () => {
        render(<TransactionStatusPending />);

        expect(screen.getByText(t("common.pending_confirmation"))).toBeInTheDocument();
    });
});
