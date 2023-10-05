import { router } from "@inertiajs/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Tooltip } from "@/Components/Tooltip";
import { useToasts } from "@/Hooks/useToasts";
import { isTruthy } from "@/Utils/is-truthy";

export const RefreshButton = ({ wallet }: { wallet: App.Data.Wallet.WalletData | null }): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const { showToast } = useToasts();

    useEffect(() => {
        if (isTruthy(wallet?.isRefreshingCollections)) {
            showToast({
                message: t("pages.collections.refresh.toast"),
                type: "pending",
                isExpanded: true,
                isLoading: true,
            });
        }
    }, []);

    const refresh = (): void => {
        setLoading(true);

        router.post(
            "/refreshed-collections",
            {},
            {
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
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
            <IconButton
                icon="Refresh"
                disabled={
                    isTruthy(wallet?.isRefreshingCollections) || !isTruthy(wallet?.canRefreshCollections) || loading
                }
                type="button"
                onClick={refresh}
            />
        </Tooltip>
    );
};
