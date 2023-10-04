import { useTranslation } from "react-i18next";
import { router } from "@inertiajs/core";
import { IconButton } from "@/Components/Buttons";
import { Tooltip } from "@/Components/Tooltip";
import { useState } from "react";

export const RefreshButton = ({ wallet }: { wallet: App.Data.Wallet.WalletData | null }): JSX.Element => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const refresh = () => {
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
        if (wallet?.canRefreshCollections) {
            return (
                <>
                    <p className="text-sm font-medium text-white">Refresh your collection</p>
                    <p className="mt-0.5 text-xs text-theme-secondary-500">You can refresh data every 15 minutes.</p>
                </>
            );
        }

        return (
            <>
                <p className="text-sm font-medium text-white">Refresh your collection</p>
                <p className="mt-0.5 text-xs text-theme-secondary-500">
                    Please wait. You can refresh data every 15 minutes.
                </p>
            </>
        );
    };

    return (
        <Tooltip content={tooltipContent()}>
            <IconButton
                icon="Refresh"
                disabled={!wallet?.canRefreshCollections || loading}
                type="button"
                onClick={refresh}
            />
        </Tooltip>
    );
};
