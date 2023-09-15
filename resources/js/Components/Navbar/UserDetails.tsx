import { Link as InertiaLink } from "@inertiajs/react";
import cn from "classnames";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/Components/Avatar";
import { ClipboardButton } from "@/Components/Clipboard";
import { Icon, type IconName } from "@/Components/Icon";
import { Link } from "@/Components/Link";
import { Popover } from "@/Components/Popover";
import { PortfolioBreakdownLine, usePortfolioBreakdown } from "@/Components/PortfolioBreakdown";
import { TokenActions } from "@/Components/Tokens/TokenActions";
import { TransactionDirection } from "@/Components/TransactionFormSlider";
import { useEnvironmentContext } from "@/Contexts/EnvironmentContext";
import { useTransactionSliderContext } from "@/Contexts/TransactionSliderContext";
import { FormatFiat } from "@/Utils/Currency";
import { formatAddress } from "@/Utils/format-address";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

interface Properties {
    wallet: App.Data.Wallet.WalletData;
    collectionCount: number;
    galleriesCount: number;
    currency: string;
}

export const UserDetails = ({ wallet, collectionCount, galleriesCount, currency }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const address = formatAddress(wallet.address);

    const { features } = useEnvironmentContext();

    const { setTransactionAsset, setTransactionSliderDirection } = useTransactionSliderContext();

    const { assets } = usePortfolioBreakdown(wallet);

    return (
        <Popover className="sm:relative">
            {({ open }) => (
                <>
                    <Trigger wallet={wallet} />

                    <Popover.Transition show={open}>
                        <Popover.Panel
                            data-testid="UserDetails__content"
                            className="absolute inset-x-4 mt-4 w-auto origin-top-right bg-transparent sm:left-auto sm:right-0 sm:mt-6 sm:w-72"
                        >
                            <div className="overflow-hidden rounded-2xl bg-white p-0">
                                <section className="bg-theme-secondary-50 px-6 py-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium leading-5.5">
                                            <span className="mr-1 text-theme-secondary-700">
                                                {t("common.my_address")}:
                                            </span>
                                            <span>
                                                <TruncateMiddle
                                                    length={10}
                                                    text={address}
                                                />
                                            </span>
                                        </div>

                                        <ClipboardButton
                                            text={address}
                                            zIndex={50}
                                        />
                                    </div>
                                </section>

                                <section>
                                    <div className="mb-6 mt-8 px-6">
                                        <div className="mb-4 flex flex-col items-center">
                                            <div className="mb-4 text-center">
                                                <p className="text-sm font-medium leading-5.5 text-theme-secondary-500">
                                                    {t("common.my_balance")}
                                                </p>
                                                <p className="text-xl font-medium leading-8 text-theme-secondary-900">
                                                    <FormatFiat
                                                        value={wallet.totalBalanceInCurrency}
                                                        currency={currency}
                                                    />
                                                </p>
                                            </div>
                                            <TokenActions
                                                onSend={() => {
                                                    setTransactionAsset(undefined);
                                                    setTransactionSliderDirection(TransactionDirection.Send);
                                                }}
                                                onReceive={() => {
                                                    setTransactionAsset(undefined);
                                                    setTransactionSliderDirection(TransactionDirection.Receive);
                                                }}
                                                balance={wallet.totalBalanceInCurrency}
                                            />
                                        </div>
                                        <div>
                                            <PortfolioBreakdownLine assets={assets} />
                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-sm font-medium leading-5.5 text-theme-secondary-700">
                                                    {t("common.tokens")}:{" "}
                                                    <span className="text-theme-secondary-900">
                                                        {Math.max(wallet.totalTokens, 1)}
                                                    </span>
                                                </p>

                                                <Link
                                                    href={route("dashboard")}
                                                    className={cn(
                                                        "transition-default rounded-sm border-b border-transparent text-sm font-medium leading-none text-theme-hint-600 outline-none ",
                                                        "hover:text-theme-hint-700",
                                                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-theme-hint-300 focus-visible:ring-offset-2",
                                                    )}
                                                >
                                                    {t("common.my_wallet")}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-theme-secondary-50 py-3.5">
                                    <nav aria-label="Account navigation">
                                        <ul className="list-none p-0">
                                            {features.galleries && (
                                                <li data-testid="AccountNavigation__galleries">
                                                    <DropdownNavigationLink
                                                        href={route("my-galleries")}
                                                        icon="Grid"
                                                        label={
                                                            <>
                                                                {t("pages.galleries.my_galleries.title")}{" "}
                                                                <span className="text-theme-secondary-500">
                                                                    ({galleriesCount})
                                                                </span>
                                                            </>
                                                        }
                                                    />
                                                </li>
                                            )}
                                            {features.collections && (
                                                <li data-testid="AccountNavigation__collections">
                                                    <DropdownNavigationLink
                                                        href={route("collections")}
                                                        icon="Diamond"
                                                        label={
                                                            <>
                                                                {t("pages.collections.title")}{" "}
                                                                <span className="text-theme-secondary-500">
                                                                    ({collectionCount})
                                                                </span>
                                                            </>
                                                        }
                                                    />
                                                </li>
                                            )}

                                            <li>
                                                <DropdownNavigationLink
                                                    href={route("settings.general")}
                                                    icon="Cog"
                                                    label={t("pages.settings.title")}
                                                />
                                            </li>

                                            <li>
                                                <DropdownNavigationLink
                                                    as="button"
                                                    method="post"
                                                    href="/logout"
                                                    icon="DoorExit"
                                                    label={t("auth.wallet.disconnect")}
                                                />
                                            </li>
                                        </ul>
                                    </nav>
                                </section>
                            </div>
                        </Popover.Panel>
                    </Popover.Transition>
                </>
            )}
        </Popover>
    );
};

const Trigger = ({ wallet }: { wallet: App.Data.Wallet.WalletData }): JSX.Element => (
    <Popover.Button
        data-testid="UserDetails__trigger"
        className="group/trigger button-secondary select-none border-theme-secondary-300 bg-white p-0 sm:border sm:py-2 sm:pl-4 sm:pr-3"
    >
        <div className="flex items-center">
            <div className="hidden items-center space-x-3 divide-x divide-theme-secondary-300 group-hover/trigger:divide-theme-secondary-400 group-focus/trigger:divide-theme-secondary-400 sm:flex">
                <span className="flex overflow-auto text-sm font-medium leading-5.5 text-theme-secondary-700">
                    {wallet.domain !== null ? (
                        <span
                            data-testid="UserDetails__domain"
                            className="max-w-23 truncate"
                        >
                            {wallet.domain}
                        </span>
                    ) : (
                        <TruncateMiddle
                            length={10}
                            text={formatAddress(wallet.address)}
                        />
                    )}
                </span>

                <div className="flex items-center pl-3">
                    <Avatar
                        address={wallet.address}
                        avatar={wallet.avatar}
                    />
                </div>
            </div>

            <div className="button-icon border-0 sm:hidden">
                <Avatar address={wallet.address} />
            </div>
        </div>
    </Popover.Button>
);

const DropdownNavigationLink = ({
    as = "a",
    href,
    method = "get",
    icon,
    label,
}: {
    as?: "a" | "button";
    href: string;
    method?: "get" | "post" | "put" | "patch" | "delete";
    icon: IconName;
    label: ReactNode;
}): JSX.Element => (
    <InertiaLink
        data-testid="UserDetails__navigationLink"
        type="button"
        href={href}
        method={method}
        as={as}
        className={cn(
            "transition-default flex w-full items-center px-5 py-2.5 font-medium text-theme-secondary-700 md-lg:px-6",
            "outline-none outline-3 outline-offset-[-3px] hover:bg-theme-secondary-200 hover:text-theme-secondary-900 focus-visible:outline-theme-hint-300",
        )}
    >
        <div className="flex items-center space-x-3 rounded-full">
            <Icon
                name={icon}
                size="lg"
            />

            <span>{label}</span>
        </div>
    </InertiaLink>
);
