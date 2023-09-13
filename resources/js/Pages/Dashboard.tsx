import { type PageProps, router } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { type HeaderGroup } from "react-table";
import { BalanceHeader } from "@/Components/BalanceHeader";
import { DashboardHeader } from "@/Components/DashboardHeader";
import { DonutChart, PortfolioBreakdownTable } from "@/Components/PortfolioBreakdown";
import { type TokensListSortBy, useTokensList } from "@/Components/PortfolioBreakdown/Hooks/useTokensList";
import { Slider, useSliderContext } from "@/Components/Slider";
import { TransactionDirection } from "@/Components/TransactionFormSlider";
import { WalletTokensTable } from "@/Components/WalletTokens/WalletTokensTable";
import { usePortfolioBreakdownContext } from "@/Contexts/PortfolioBreakdownContext";
import { useTransactionSliderContext } from "@/Contexts/TransactionSliderContext";
import { useAuth } from "@/Hooks/useAuth";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";

const RELOAD_USER_DATA_INTERVAL = 60 * 5 * 1000; // 5 minutes

const INITIAL_RELOAD_USER_DATA_INTERVAL = 5 * 1000; // 5 seconds

const LoadingDashboard = (): JSX.Element => (
    <div>
        <BalanceHeader
            isLoading
            skeletonAnimated={false}
            balance="0"
            address=""
            assets={[]}
            currency=""
        />

        <div className="mt-8">
            <WalletTokensTable
                isLoading
                tokens={[]}
                currency=""
            />
        </div>
    </div>
);

const DashboardContent = ({
    loading,
    loadingBreakdown,
    breakdownAssets,
    assets,
    onSend,
    onReceive,
    onLoadMore,
    onSort,
    sortBy,
    sortDirection,
}: {
    loadingBreakdown: boolean;
    loading: boolean;
    assets: App.Data.TokenListItemData[];
    breakdownAssets: App.Data.TokenPortfolioData[];
    onSend?: (asset?: App.Data.TokenListItemData) => void;
    onReceive?: (asset?: App.Data.TokenListItemData) => void;
    onLoadMore?: () => void;
    onSort?: (column: HeaderGroup<App.Data.TokenListItemData>) => void;
    sortBy: TokensListSortBy;
    sortDirection: "asc" | "desc";
}): JSX.Element => {
    const { t } = useTranslation();

    const { wallet, user } = useAuth();

    const { isOpen: isBreakdownOpen, setOpen: setBreakdownOpen } = useSliderContext();

    if (!isTruthy(user)) {
        return <LoadingDashboard />;
    }

    return (
        <>
            <div>
                {wallet !== null && (
                    <BalanceHeader
                        isLoading={loadingBreakdown}
                        balance={wallet.totalBalanceInCurrency}
                        address={formatAddress(wallet.address)}
                        assets={breakdownAssets}
                        // Users should have at least 1 token because it
                        // falls back to the MATIC token
                        tokens={Math.max(wallet.totalTokens, 1)}
                        currency={user.attributes.currency}
                        onSend={onSend}
                        onReceive={onReceive}
                    />
                )}

                {isTruthy(wallet) && (
                    <div className="mt-8">
                        <WalletTokensTable
                            isLoading={loading}
                            user={user}
                            tokens={assets}
                            currency={user.attributes.currency}
                            onSend={onSend}
                            onReceive={onReceive}
                            onLoadMore={onLoadMore}
                            onSort={onSort}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            wallet={wallet}
                        />
                    </div>
                )}
            </div>

            <Slider
                isOpen={isBreakdownOpen}
                onClose={() => {
                    setBreakdownOpen(false);
                }}
            >
                <Slider.Header>
                    <span className="text-lg font-medium leading-8">{t("pages.dashboard.breakdown.title")}</span>
                </Slider.Header>

                <Slider.Content>
                    <div className="flex justify-center">
                        {isTruthy(wallet) && (
                            <DonutChart
                                assets={breakdownAssets}
                                currency={user.attributes.currency}
                            />
                        )}
                    </div>

                    {isTruthy(wallet) && (
                        <PortfolioBreakdownTable
                            assets={breakdownAssets}
                            currency={user.attributes.currency}
                        />
                    )}
                </Slider.Content>
            </Slider>
        </>
    );
};

const Dashboard = ({ auth }: PageProps): JSX.Element => {
    const { t } = useTranslation();
    const { props } = usePage();

    const {
        tokens,
        loading,
        loadingMore,
        loadTokens,
        loadMoreTokens,
        reloadAllTokens,
        sortBy,
        sortDirection,
        updateSort,
    } = useTokensList();

    const { breakdownAssets, loadingBreakdown } = usePortfolioBreakdownContext();

    const { setTransactionAsset, setTransactionSliderDirection } = useTransactionSliderContext();

    const reloadInterval =
        auth.wallet?.timestamps.tokens_fetched_at === null ||
        auth.wallet?.timestamps.native_balances_fetched_at === null
            ? INITIAL_RELOAD_USER_DATA_INTERVAL
            : RELOAD_USER_DATA_INTERVAL;

    useEffect(() => {
        if (!auth.authenticated) {
            return;
        }

        const interval = setInterval(() => {
            void reloadAllTokens();
        }, reloadInterval);

        return () => {
            clearInterval(interval);
        };
    }, [reloadInterval, reloadAllTokens]);

    useEffect(() => {
        if (!auth.authenticated) {
            return;
        }

        void loadTokens();
    }, [reloadInterval]);

    const onLoadMore = useCallback(() => {
        if (loadingMore) {
            return;
        }

        router.reload({ only: ["auth"] });

        loadMoreTokens();
    }, [loadingMore, loadMoreTokens]);

    return (
        <DefaultLayout
            auth={auth}
            toastMessage={props.toast}
        >
            <Head title={t("metatags.wallet.title")} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <div className="sm:mb-4">
                    <DashboardHeader
                        balance={Number(auth.wallet?.totalBalanceInCurrency ?? 0)}
                        onSend={() => {
                            setTransactionAsset(undefined);
                            setTransactionSliderDirection(TransactionDirection.Send);
                        }}
                        onReceive={() => {
                            setTransactionAsset(undefined);
                            setTransactionSliderDirection(TransactionDirection.Receive);
                        }}
                    />
                </div>

                <DashboardContent
                    onLoadMore={onLoadMore}
                    loadingBreakdown={loadingBreakdown}
                    loading={loading}
                    assets={tokens}
                    breakdownAssets={breakdownAssets}
                    onSort={({ isSortedDesc, id, sortDescFirst, isSorted }) => {
                        if (sortDescFirst === false && !isSorted) {
                            updateSort(id as TokensListSortBy, "desc");
                        } else {
                            updateSort(id as TokensListSortBy, isSortedDesc === true ? "desc" : "asc");
                        }
                    }}
                    onSend={(asset) => {
                        setTransactionAsset(asset);
                        setTransactionSliderDirection(TransactionDirection.Send);
                    }}
                    onReceive={(asset) => {
                        setTransactionAsset(asset);
                        setTransactionSliderDirection(TransactionDirection.Receive);
                    }}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                />
            </div>
        </DefaultLayout>
    );
};

export default Dashboard;
