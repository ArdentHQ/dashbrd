import cn from "classnames";
import { type HTMLAttributes, useEffect, useState } from "react";
import { AuthOverlay } from "@/Components/Layout/AuthOverlay";
import { Footer } from "@/Components/Layout/Footer";
import { Navbar } from "@/Components/Layout/Navbar";
import { SliderContext } from "@/Components/Slider";
import { ToastContainer, type ToastMessage } from "@/Components/Toast";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";

interface LayoutWrapperProperties extends HTMLAttributes<HTMLDivElement> {
    useVerticalOffset?: boolean;
    withSlider?: boolean;
    toastMessage?: ToastMessage;
    isMaintenanceModeActive?: boolean;
}

export const LayoutWrapper = ({
    children,
    className,
    useVerticalOffset = true,
    withSlider = false,
    toastMessage,
    isMaintenanceModeActive,
}: LayoutWrapperProperties): JSX.Element => {
    const { authenticated, showAuthOverlay, wallet, user, showCloseButton, closeOverlay, signed } = useAuth();

    const { setAuthData } = useActiveUser();

    useEffect(() => {
        setAuthData?.({
            authenticated,
            wallet,
            user,
            signed,
        });
    }, [authenticated, user, wallet]);

    const { connectWallet, initialized, connecting } = useMetaMaskContext();

    const content = (
        <div
            data-testid="LayoutWrapper"
            className="flex min-h-screen flex-col"
        >
            <header className="relative z-50">
                <Navbar
                    connectWallet={connectWallet}
                    initialized={initialized}
                    connecting={connecting}
                    authenticated={authenticated}
                    wallet={wallet}
                    user={user ?? undefined}
                    isMaintenanceModeActive={isMaintenanceModeActive}
                />
            </header>

            <AuthOverlay
                showAuthOverlay={showAuthOverlay}
                showCloseButton={showCloseButton}
                closeOverlay={closeOverlay}
            />

            <div className={cn("flex flex-1 flex-col", { blur: showAuthOverlay })}>
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
