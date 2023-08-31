import { t } from "i18next";
import { TransactionStatusError } from "./TransactionStatusError";
import { render, screen } from "@/Tests/testing-library";

describe("TransactionStatusError", () => {
    it("should render", () => {
        render(
            <TransactionStatusError
                chainId={1}
                hash="0x123"
            />,
        );

        expect(screen.getByTestId("TransactionStatus__Errored")).toBeInTheDocument();
    });

    it("should display error message in two parts", () => {
        render(
            <TransactionStatusError
                chainId={1}
                hash="0x123"
            />,
        );

        expect(screen.getByText(t("common.transaction_error_description_first_part"))).toBeInTheDocument();
        expect(screen.getByText(t("common.transaction_error_description_second_part"))).toBeInTheDocument();
    });

    it("should display transaction explorer link for chainId 1 (Ethereum Mainnet)", () => {
        render(
            <TransactionStatusError
                chainId={1}
                hash="0x123"
            />,
        );

        expect(screen.getByText(t("common.etherscan"))).toBeInTheDocument();
    });

    it("should display transaction explorer link for chainId 137 (Polygon Mainnet)", () => {
        render(
            <TransactionStatusError
                chainId={137}
                hash="0x123"
            />,
        );

        expect(screen.getByText(t("common.polygonscan"))).toBeInTheDocument();
    });

    it("should contain url with transaction hash", () => {
        render(
            <TransactionStatusError
                chainId={1}
                hash="0x123"
            />,
        );

        expect(screen.getByTestId("Link__anchor")).toHaveAttribute("href", "https://etherscan.io/tx/0x123");
    });
});
