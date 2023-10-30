import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Tooltip } from "@/Components/Tooltip";
import { useToasts } from "@/Hooks/useToasts";
import { isTruthy } from "@/Utils/is-truthy";

export const RefreshButton = ({ wallet }: { wallet: App.Data.Wallet.WalletData | null }): JSX.Element => {
    const [disabled, setDisabled] = useState(false);
    const { t } = useTranslation();

    const { showToast } = useToasts();

    const refresh = (): void => {
        setDisabled(true);

        void window.axios.post(route("refresh-collections"));

        showToast({
            type: "pending",
            message: t("pages.collections.refresh.toast"),
            isExpanded: true,
        });
    };

    const tooltipContent = (): JSX.Element => {
        if (isTruthy(wallet?.canRefreshCollections)) {
            return (
                <>
                    <p className="text-sm font-medium text-white">{t("pages.collections.refresh.title")}</p>
                    <p className="mt-0.5 text-xs text-theme-secondary-500">{t("pages.collections.refresh.notice")}</p>
                </>
            );
        }

        return (
            <>
                <p className="text-sm font-medium text-white">{t("pages.collections.refresh.title")}</p>
                <p className="mt-0.5 text-xs text-theme-secondary-500">{t("pages.collections.refresh.notice_wait")}</p>
            </>
        );
    };

    return (
        <Tooltip content={tooltipContent()}>
            <span
                tabIndex={-1}
                className="inline-flex"
            >
                <IconButton
                    icon="Refresh"
                    disabled={
                        isTruthy(wallet?.isRefreshingCollections) ||
                        !isTruthy(wallet?.canRefreshCollections) ||
                        disabled
                    }
                    type="button"
                    onClick={refresh}
                />
            </span>
        </Tooltip>
    );
};
