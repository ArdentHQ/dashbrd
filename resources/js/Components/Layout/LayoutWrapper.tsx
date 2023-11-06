import cn from "classnames";
import { type HTMLAttributes, useState } from "react";
import { AuthOverlay } from "@/Components/Layout/AuthOverlay";
import { Footer } from "@/Components/Layout/Footer";
import { Navbar } from "@/Components/Layout/Navbar";
import { SliderContext } from "@/Components/Slider";
import { ToastContainer, type ToastMessage } from "@/Components/Toast";
import { useAuth } from "@/Contexts/AuthContext";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuthOverlay } from "@/Hooks/useAuthOverlay";

interface LayoutWrapperProperties extends HTMLAttributes<HTMLDivElement> {
    useVerticalOffset?: boolean;
    withSlider?: boolean;
    toastMessage?: ToastMessage;
    isMaintenanceModeActive?: boolean;
    belowHeader?: React.ReactNode;
    mustBeSigned?: boolean;
    displayAuthOverlay?: boolean;
    showBackButton?: boolean;
}

export const LayoutWrapper = ({
    children,
    belowHeader,
    className,
    useVerticalOffset = true,
    withSlider = false,
    toastMessage,
    isMaintenanceModeActive,
    mustBeSigned = false,
    displayAuthOverlay = true,
    showBackButton = false,
}: LayoutWrapperProperties): JSX.Element => {
    const { authenticated, signed, wallet, user, logout } = useAuth();

    const { showAuthOverlay, showCloseButton, closeOverlay } = useAuthOverlay({
        mustBeSigned,
    });

    const { connectWallet, initialized, connecting } = useMetaMaskContext();

    const content = (
        <div
            data-testid="LayoutWrapper"
            className="flex min-h-screen flex-col"
        >
            <header className="relative z-50 border-b border-theme-secondary-300 bg-white dark:border-theme-dark-700 dark:bg-theme-dark-900">
                <Navbar
                    connectWallet={connectWallet}
                    initialized={initialized}
                    connecting={connecting}
                    authenticated={authenticated}
                    wallet={wallet}
                    user={user ?? undefined}
                    isMaintenanceModeActive={isMaintenanceModeActive}
                    onLogout={() => {
                        void logout();
                    }}
                />
            </header>

            {displayAuthOverlay && (
                <AuthOverlay
                    show={showAuthOverlay}
                    showCloseButton={showCloseButton}
                    mustBeSigned={mustBeSigned}
                    closeOverlay={closeOverlay}
                    showBackButton={showBackButton}
                    // If we show the auth overlay even if the state says we are signed,
                    // means that the session has expired
                    sessionMayExpired={authenticated && signed}
                />
            )}

            {belowHeader}

            <div
                id="layout"
                className={cn("flex flex-1 flex-col")}
            >
                <main
                    className={cn(
                        "mx-auto flex w-full max-w-content flex-1 flex-col",
                        {
                            "py-6 sm:py-8": useVerticalOffset,
                        },
                        className,
                    )}
                >
                    {children}
                </main>

                <Footer withActionToolbar={withSlider} />
            </div>

            <ToastContainer toastMessage={toastMessage} />
        </div>
    );

    if (withSlider) {
        const [isSliderOpen, setSliderOpen] = useState(false);

        return (
            <SliderContext.Provider value={{ isOpen: isSliderOpen, setOpen: setSliderOpen }}>
                {content}
            </SliderContext.Provider>
        );
    }

    return content;
};
