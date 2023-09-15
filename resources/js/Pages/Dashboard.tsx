import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { BalanceHeader } from "@/Components/BalanceHeader";
import { DashboardHeader } from "@/Components/DashboardHeader";
import { DonutChart, PortfolioBreakdownTable, usePortfolioBreakdown } from "@/Components/PortfolioBreakdown";
import { Slider, useSliderContext } from "@/Components/Slider";
import { TransactionDirection } from "@/Components/TransactionFormSlider";
import { WalletTokensTable } from "@/Components/WalletTokens/WalletTokensTable";
import { useTransactionSliderContext } from "@/Contexts/TransactionSliderContext";
import { useActiveWallet } from "@/Hooks/useActiveWallet";
import { useWalletTokens, type WalletTokensSortBy } from "@/Hooks/useWalletTokens";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";

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
    onSend,
    onReceive,
    wallet,
    user,
}: {
    user?: App.Data.UserData | null;
    wallet?: App.Data.Wallet.WalletData | null;
    onSend?: (asset?: App.Data.TokenListItemData) => void;
    onReceive?: (asset?: App.Data.TokenListItemData) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const { isOpen: isBreakdownOpen, setOpen: setBreakdownOpen } = useSliderContext();
    const { assets: breakdownAssets, isLoading: isLoadingBreakdown } = usePortfolioBreakdown(wallet);
    const { isLoading, loadMore, tokens, updateSortOptions, sortOptions } = useWalletTokens(wallet);

    if (!isTruthy(user) || !isTruthy(wallet)) {
        return <LoadingDashboard />;
    }

    return (
        <>
            <div>
                <BalanceHeader
                    isLoading={isLoadingBreakdown}
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

                <div className="mt-8">
                    <WalletTokensTable
                        isLoading={isLoading}
                        user={user}
                        tokens={tokens}
                        currency={user.attributes.currency}
                        onSend={onSend}
                        onReceive={onReceive}
                        onLoadMore={loadMore}
                        onSort={({ isSortedDesc, id, sortDescFirst, isSorted }) => {
                            if (sortDescFirst === false && !isSorted) {
                                updateSortOptions(id as WalletTokensSortBy, "desc");
                            } else {
                                updateSortOptions(id as WalletTokensSortBy, isSortedDesc === true ? "desc" : "asc");
                            }
                        }}
                        sortBy={sortOptions.sort}
                        sortDirection={sortOptions.direction}
                        wallet={wallet}
                    />
                </div>
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

    const { setTransactionAsset, setTransactionSliderDirection } = useTransactionSliderContext();
    const { wallet, user } = useActiveWallet(auth.wallet);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={t("metatags.wallet.title")} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <div className="sm:mb-4">
                    <DashboardHeader
                        balance={Number(wallet?.totalBalanceInCurrency ?? 0)}
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
                    wallet={wallet}
                    user={user}
                    onSend={(asset) => {
                        setTransactionAsset(asset);
                        setTransactionSliderDirection(TransactionDirection.Send);
                    }}
                    onReceive={(asset) => {
                        setTransactionAsset(asset);
                        setTransactionSliderDirection(TransactionDirection.Receive);
                    }}
                />
            </div>
        </DefaultLayout>
    );
};

export default Dashboard;
