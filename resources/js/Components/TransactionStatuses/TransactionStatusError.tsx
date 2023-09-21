import { useTranslation } from "react-i18next";
import { Link } from "@/Components/Link";
import { Toast } from "@/Components/Toast";
import { ExplorerChains } from "@/Utils/Explorer";

export const TransactionStatusError = ({ chainId, hash }: { chainId: number; hash: string }): JSX.Element => {
    const { t } = useTranslation();

    const transactionHashUrl =
        chainId === ExplorerChains.EthereumMainnet
            ? t("urls.explorers.etherscan.transactions", { id: hash })
            : t("urls.explorers.polygonscan.transactions", { id: hash });

    const transactionExplorer =
        chainId === ExplorerChains.EthereumMainnet ? t("common.etherscan") : t("common.polygonscan");

    const toastMessage = (
        <span
            className="space-x-1"
            data-testid="TransactionStatus__Errored"
        >
            <span>{t("common.transaction_error_description_first_part")}</span>
            <Link
                href={transactionHashUrl}
                className="outline-offset-3 transition-default inline-flex items-center space-x-2 whitespace-nowrap rounded-full text-theme-primary-600 underline decoration-transparent underline-offset-2 outline-none outline-3 hover:text-theme-primary-700 hover:decoration-theme-primary-700 focus-visible:outline-theme-primary-300"
                external
            >
                {transactionExplorer}
            </Link>
            <span>{t("common.transaction_error_description_second_part")}</span>
        </span>
    );

    return (
        <div data-testid="TransactionStatus__Error">
            <Toast
                message={toastMessage}
                type="error"
                isExpanded
            />
        </div>
    );
};
