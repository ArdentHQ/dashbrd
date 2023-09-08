import { Link } from "@inertiajs/react";
import cn from "classnames";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/Components/Avatar";
import { Button, IconButton } from "@/Components/Buttons";
import { ClipboardButton } from "@/Components/Clipboard";
import { Icon, type IconName } from "@/Components/Icon";
import { PortfolioBreakdownLine, usePortfolioBreakdown } from "@/Components/PortfolioBreakdown";
import { Slider } from "@/Components/Slider";
import { TokenActions } from "@/Components/Tokens/TokenActions";
import { TransactionDirection } from "@/Components/TransactionFormSlider";
import { useEnvironmentContext } from "@/Contexts/EnvironmentContext";
import { useTransactionSliderContext } from "@/Contexts/TransactionSliderContext";
import { FormatFiat } from "@/Utils/Currency";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

interface Properties {
    wallet: App.Data.Wallet.WalletData | null;
    currency?: string;
    connectWallet?: () => Promise<void>;
    isConnectButtonDisabled?: boolean;
}

export const MobileMenu = ({ wallet, currency, connectWallet, isConnectButtonDisabled }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const isAuthenticated = isTruthy(wallet);

    const [isMenuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <IconButton
                icon="Menu"
                onClick={() => {
                    setMenuOpen(true);
                }}
                data-testid="MobileMenu__Trigger"
                baseClassName="md-lg:hidden mr-3 border-white xs:border-theme-secondary-300 w-auto xs:w-10"
            />
            <Slider
                isOpen={isMenuOpen}
                isFullScreen={true}
                panelClassName="sm:max-w-full"
                onClose={() => {
                    setMenuOpen(false);
                }}
            >
                <Slider.Header className="fixed h-14 w-full bg-white px-6 py-4 text-lg font-medium leading-7 text-theme-secondary-900 xs:h-18 sm:px-8">
                    {t("common.menu")}
                </Slider.Header>

                <Slider.Content includePadding={false}>
                    <div
                        className="pb-48 pt-14 xs:pt-18"
                        data-testid="MobileMenu__Content"
                    >
                        <section className="pt-6">
                            <Nav
                                collectionCount={wallet?.collectionCount}
                                galleryCount={wallet?.galleryCount}
                                isAuthenticated={isAuthenticated}
                            />
                        </section>

                        <section className="fixed bottom-0 w-full border-t border-theme-secondary-300 bg-white py-4">
                            {isAuthenticated && currency !== undefined && (
                                <div
                                    className="px-6 sm:px-8"
                                    data-testid="MobileMenu__MainContent"
                                >
                                    <TransactionActions
                                        wallet={wallet}
                                        currency={currency}
                                        closeMenu={() => {
                                            setMenuOpen(false);
                                        }}
                                    />
                                    <PortfolioBreakdown wallet={wallet} />
                                    <Footer address={wallet.address} />
                                </div>
                            )}
                            {!isAuthenticated && (
                                <div className="flex justify-center px-6 sm:px-8">
                                    <Button
                                        data-testid="MobileMenu__ConnectButton"
                                        className="flex w-full justify-center space-x-1"
                                        disabled={Boolean(isConnectButtonDisabled)}
                                        onClick={() => {
                                            setMenuOpen(false);
                                            void connectWallet?.();
                                        }}
                                    >
                                        <span data-testid="Navbar__connect">{t("common.connect")}</span>

                                        <span className="hidden sm:inline">{t("common.wallet")}</span>
                                    </Button>
                                </div>
                            )}
                        </section>
                    </div>
                </Slider.Content>
            </Slider>
        </>
    );
};

const Nav = ({
    collectionCount,
    galleryCount,
    isAuthenticated,
}: {
    collectionCount?: number;
    galleryCount?: number;
    isAuthenticated: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    const { features } = useEnvironmentContext();

    const activeRoute = route().current();

    const items = [
        {
            isVisible: features.collections,
            title: t("pages.collections.title"),
            suffix: isAuthenticated ? collectionCount : null,
            route: "collections",
            icon: "Diamond",
        },
        {
            isVisible: features.galleries,
            title: t("pages.galleries.title"),
            suffix: null,
            route: "galleries",
            icon: "Image",
            className: isAuthenticated ? "border-b border-theme-secondary-300 pb-3.5 mb-3.5" : "",
        },
        {
            isVisible: isAuthenticated,
            title: t("pages.galleries.my_galleries.title"),
            suffix: galleryCount,
            route: "my-galleries",
            icon: "Grid",
        },
        {
            isVisible: isAuthenticated,
            title: t("pages.settings.title"),
            suffix: null,
            route: "settings.general",
            icon: "Cog",
        },
    ];

    return (
        <nav aria-label="Account navigation">
            <ul className="list-none space-y-6 p-0 px-6 sm:px-8">
                {items
                    .filter((item) => item.isVisible)
                    .map((item, index) => (
                        <li
                            key={index}
                            className={cn(item.className)}
                        >
                            <NavLink
                                href={route(item.route)}
                                icon={item.icon as IconName}
                                active={item.route === activeRoute}
                                label={
                                    <>
                                        {item.title}{" "}
                                        {item.suffix !== null && (
                                            <span className="text-theme-secondary-500">({item.suffix})</span>
                                        )}
                                    </>
                                }
                            />
                        </li>
                    ))}
            </ul>
        </nav>
    );
};

export const NavLink = ({
    icon,
    label,
    href,
    active = false,
}: {
    href: string;
    icon: IconName;
    label: ReactNode;
    active?: boolean;
}): JSX.Element => (
    <Link href={href}>
        <div
            data-testid="MobileMenu__NavLink"
            className={cn("flex items-center space-x-3 rounded-full font-medium", {
                "text-theme-secondary-900": active,
                "text-theme-secondary-700": !active,
            })}
        >
            <div className="rounded-full bg-theme-hint-50 p-2.5">
                <Icon
                    name={icon}
                    size="lg"
                />
            </div>

            <span>{label}</span>
        </div>
    </Link>
);

const TransactionActions = ({
    wallet,
    currency,
    closeMenu,
}: {
    wallet: App.Data.Wallet.WalletData;
    currency: string;
    closeMenu: () => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const { setTransactionAsset, setTransactionSliderDirection } = useTransactionSliderContext();

    return (
        <div className="mb-4 flex items-end justify-between">
            <div>
                <p className="text-sm font-medium leading-5.5 text-theme-secondary-500">{t("common.my_balance")}</p>
                <p className="text-xl font-medium leading-8 text-theme-secondary-900">
                    <FormatFiat
                        value={wallet.totalBalanceInCurrency}
                        currency={currency}
                    />
                </p>
            </div>
            <TokenActions
                onSend={() => {
                    closeMenu();
                    setTransactionAsset(undefined);
                    setTransactionSliderDirection(TransactionDirection.Send);
                }}
                onReceive={() => {
                    closeMenu();
                    setTransactionAsset(undefined);
                    setTransactionSliderDirection(TransactionDirection.Receive);
                }}
                balance={wallet.totalBalanceInCurrency}
            />
        </div>
    );
};

const PortfolioBreakdown = ({ wallet }: { wallet: App.Data.Wallet.WalletData }): JSX.Element => {
    const { t } = useTranslation();
    const { assets } = usePortfolioBreakdown(wallet);

    const tokenCount = Math.max(wallet.totalTokens, 1);

    return (
        <>
            <div className="mb-4">
                <PortfolioBreakdownLine assets={assets} />

                <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-medium leading-5.5 text-theme-secondary-700">
                        {t("common.tokens")}: <span className="text-theme-secondary-900">{tokenCount}</span>
                    </p>

                    <Link
                        href={route("dashboard")}
                        className="transition-default text-sm font-medium text-theme-hint-600 hover:text-theme-hint-700"
                    >
                        {t("common.my_wallet")}
                    </Link>
                </div>
            </div>
        </>
    );
};

const Footer = ({ address }: { address: string }): JSX.Element => {
    address = formatAddress(address);

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 font-medium text-theme-secondary-700">
                <div className="mr-3 flex items-center border-r border-theme-secondary-300 pr-3">
                    <Avatar address={address} />
                </div>
                <TruncateMiddle
                    length={10}
                    text={address}
                />
                <ClipboardButton
                    text={address}
                    zIndex={50}
                />
            </div>
            <Link
                href={route("logout")}
                method="post"
                as="button"
            >
                <Icon
                    name="DoorExit"
                    className="h-5 w-5 text-theme-hint-600"
                />
            </Link>
        </div>
    );
};
