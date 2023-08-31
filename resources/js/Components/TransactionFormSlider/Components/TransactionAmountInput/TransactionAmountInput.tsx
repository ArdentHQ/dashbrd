import { useTranslation } from "react-i18next";
import { Listbox } from "@/Components/Form/Listbox";
import { TextInput } from "@/Components/Form/TextInput";
import { isTruthy } from "@/Utils/is-truthy";

export const TransactionAmountInput = ({
    amount,
    asset,
    onAmountChange,
    error,
    onSelectMaxAmount,
}: {
    error?: string;
    amount?: string | number;
    asset?: App.Data.TokenListItemData;
    onAmountChange?: (amount: string) => void;
    onSelectMaxAmount?: () => void;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Listbox.Input
            data-testid="TransactionSendForm_Token_Amount_Input"
            disabled={!isTruthy(asset)}
            wrapperClassName="hidden-arrows"
            type="number"
            hasError={isTruthy(error)}
            value={amount ?? ""}
            onChange={(event) => {
                onAmountChange?.(event.target.value);
            }}
            placeholder={t("pages.send_receive_panel.send.placeholders.enter_amount")}
            after={
                <TextInput.Button
                    data-testid="TransactionSendForm_Token_Amount_Button"
                    disabled={asset === undefined}
                    onClick={() => {
                        onSelectMaxAmount?.();
                    }}
                >
                    {t("common.max")}
                </TextInput.Button>
            }
        />
    );
};
