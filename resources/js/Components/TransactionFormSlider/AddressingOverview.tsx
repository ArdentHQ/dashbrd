import { useTranslation } from "react-i18next";
import { Label, Wallet } from "./Steps/ExecutionStep.blocks";
import { Icon } from "@/Components/Icon";
import { isTruthy } from "@/Utils/is-truthy";

export const AddressingOverview = ({
    fromAddress,
    toAddress,
}: {
    fromAddress?: string;
    toAddress: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="relative rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700"
            data-testid="AddressingOverview__Container"
        >
            <div className="border-b border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700">
                <Label>{t("pages.send_receive_panel.send.from")}</Label>
                {isTruthy(fromAddress) && <Wallet address={fromAddress} />}
            </div>
            <div className="z-1 absolute right-6 top-1/2 flex h-10 w-10 -translate-y-2/4 items-center justify-center rounded-full border border-theme-secondary-300 bg-white dark:border-theme-dark-700 dark:bg-theme-dark-900">
                <Icon
                    name="FatArrowDown"
                    className="text-theme-secondary-700 dark:text-theme-dark-200"
                />
            </div>
            <div className="px-6 py-4">
                <Label>{t("pages.send_receive_panel.send.to")}</Label>
                <Wallet address={toAddress} />
            </div>
        </div>
    );
};
