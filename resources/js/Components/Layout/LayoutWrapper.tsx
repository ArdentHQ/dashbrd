import cn from "classnames";
import { type HTMLAttributes, useState } from "react";
import { AuthOverlay } from "@/Components/Layout/AuthOverlay";
import { Footer } from "@/Components/Layout/Footer";
import { Navbar } from "@/Components/Layout/Navbar";
import { SliderContext } from "@/Components/Slider";
import { ToastContainer, type ToastMessage } from "@/Components/Toast";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";

interface LayoutWrapperProperties extends HTMLAttributes<HTMLDivElement> {
    useVerticalOffset?: boolean;
    withSlider?: boolean;
    toastMessage?: ToastMessage;
    isMaintenanceModeActive?: boolean;
    belowHeader?: React.ReactNode;
    mustBeSigned?: boolean;
    displayAuthOverlay?: boolean;
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
}: LayoutWrapperProperties): JSX.Element => {
    const { authenticated, showAuthOverlay, wallet, user, showCloseButton, closeOverlay } = useAuth({
        mustBeSigned,
    });

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

            {displayAuthOverlay && (
                <AuthOverlay
                    show={showAuthOverlay}
                    showCloseButton={showCloseButton}
                    mustBeSigned={mustBeSigned}
                    closeOverlay={closeOverlay}
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
