import { useTranslation } from "react-i18next";
import { Toast } from "@/Components/Toast";

export const TransactionStatusConfirmed = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div data-testid="TransactionStatus__Confirmed">
            <Toast
                message={t("common.confirmed_transaction")}
                type="success"
            />
        </div>
    );
};
