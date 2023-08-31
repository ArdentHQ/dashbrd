import { useTranslation } from "react-i18next";
import { Toast } from "@/Components/Toast";

export const TransactionStatusPending = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div data-testid="TransactionStatus__Pending">
            <Toast
                message={t("common.pending_confirmation")}
                type="pending"
            />
        </div>
    );
};
