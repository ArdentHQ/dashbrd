import { Link } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons/Button";
import { Icon } from "@/Components/Icon";
import { AppMenu } from "@/Components/Navbar/AppMenu";
import { MobileMenu } from "@/Components/Navbar/MobileMenu";
import { UserDetails } from "@/Components/Navbar/UserDetails";
import { type MetaMaskState } from "@/Hooks/useMetaMask";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties
    extends React.HTMLAttributes<HTMLDivElement>,
        Pick<MetaMaskState, "connecting" | "initialized" | "connectWallet"> {
    authenticated: boolean;
    wallet: App.Data.AuthData["wallet"];
    user?: App.Data.UserData;
    isMaintenanceModeActive?: boolean;
    onLogout: () => void;
}

export const Navbar = ({
    className,
    connecting,
    wallet,
    user,
    initialized,
    connectWallet,
    authenticated,
    isMaintenanceModeActive,
    onLogout,
    ...properties
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    const isAuthenticated = authenticated && isTruthy(wallet) && isTruthy(user);

    const renderAddress = (): JSX.Element => {
        if (isAuthenticated) {
            const { collectionCount, galleryCount } = wallet;

            return (
                <UserDetails
                    wallet={wallet}
                    collectionCount={collectionCount}
                    galleriesCount={galleryCount}
                    currency={user.attributes.currency}
                    onLogout={onLogout}
                />
            );
        }

        return (
            <Button
                className="space-x-1"
                disabled={isTruthy(isMaintenanceModeActive) || connecting || !initialized}
                onClick={() => {
                    void connectWallet();
                }}
            >
                <span data-testid="Navbar__connect">{t("common.connect")}</span>

                <span className="hidden sm:inline">{t("common.wallet")}</span>
            </Button>
        );
    };

    return (
        <nav
            data-testid="Navbar"
            className={cn(
                "transition-default flex h-14 items-center justify-between border-b border-theme-secondary-300 bg-white px-6 py-2 dark:border-theme-dark-700 dark:bg-theme-dark-900 xs:h-18 sm:px-8 sm:py-0",
                className,
            )}
            {...properties}
        >
            <div className="flex items-center">
                <MobileMenu
                    wallet={wallet}
                    connectWallet={connectWallet}
                    onLogout={onLogout}
                    currency={user?.attributes.currency}
                    isConnectButtonDisabled={isTruthy(isMaintenanceModeActive) || connecting || !initialized}
                />
                <div className="flex items-center sm:space-x-4">
                    <Logo />

                    <AppMenu />
                </div>
            </div>

            <div className="hidden items-center sm:space-x-3 md-lg:flex">{renderAddress()}</div>
        </nav>
    );
};

const Logo = (): JSX.Element => (
    <div className="flex items-center">
        <Link
            href={route("galleries")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center rounded-full outline-none outline-3 outline-offset-4 focus-visible:outline-theme-primary-300"
        >
            <Icon
                name="Logo"
                size="2xl"
                className="hidden sm:block"
            />

            <Icon
                name="Logo"
                size="xl"
                className="sm:hidden"
            />
        </Link>
    </div>
);
