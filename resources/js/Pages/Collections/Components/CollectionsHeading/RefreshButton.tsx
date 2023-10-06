import { router } from "@inertiajs/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { Tooltip } from "@/Components/Tooltip";
import { useToasts } from "@/Hooks/useToasts";
import { isTruthy } from "@/Utils/is-truthy";
import axios from "axios";
import { usePage } from "@inertiajs/react";

export const RefreshButton = ({ wallet }: { wallet: App.Data.Wallet.WalletData | null }): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const { showToast, clear } = useToasts();

    const { props } = usePage();

    useEffect(() => {
        if (isTruthy(props.auth.wallet?.isRefreshingCollections)) {
            const interval = setInterval(async () => {
                const { data } = await axios.get<{
                    indexing: boolean;
                }>(route("refreshed-collections-status"));

                if (!data.indexing) {
                    router.reload({
                        onFinish: () => {
                            clear();

                            clearInterval(interval);
                        },
                    });
                }
            }, 1500);

            return () => {
                clearInterval(interval);
            };
        }
    }, []);

    useEffect(() => {
        return router.on("navigate", (event) => {
            if (isTruthy(event.detail.page.props.auth.wallet?.isRefreshingCollections)) {
                clear();

                showToast({
                    message: t("pages.collections.refresh.toast"),
                    type: "pending",
                    isExpanded: true,
                    isLoading: true,
                });
            }
        });
    }, []);

    const refresh = (): void => {
        setLoading(true);

        router.post(
            route("refresh-collections"),
            {},
            {
                preserveState: false,
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
            <span
                tabIndex={-1}
                className="inline-flex"
            >
                <IconButton
                    icon="Refresh"
                    disabled={
                        isTruthy(wallet?.isRefreshingCollections) || !isTruthy(wallet?.canRefreshCollections) || loading
                    }
                    type="button"
                    onClick={refresh}
                />
            </span>
        </Tooltip>
    );
};
