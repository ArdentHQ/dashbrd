import { t } from "i18next";
import { TransactionStatusConfirmed } from "./TransactionStatusConfirmed";
import { render, screen } from "@/Tests/testing-library";

describe("TransactionStatusConfirmed", () => {
    it("should render", () => {
        render(<TransactionStatusConfirmed />);

        expect(screen.getByTestId("TransactionStatus__Confirmed")).toBeInTheDocument();
    });

    it("should display confirmation message", () => {
        render(<TransactionStatusConfirmed />);

        expect(screen.getByText(t("common.confirmed_transaction"))).toBeInTheDocument();
    });
});
