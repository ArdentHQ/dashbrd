import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import cn from "classnames";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    ConnectingWallet,
    ConnectionError,
    ConnectWallet,
    InstallMetamask,
    SwitchingNetwork,
} from "./AuthOverlay.blocks";
import { type AuthOverlayProperties } from "./AuthOverlay.contracts";
import { Heading } from "@/Components/Heading";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";
import { AuthConnectWallet } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

export const AuthOverlay = ({ className, ...properties }: AuthOverlayProperties): JSX.Element => {
    const { t } = useTranslation();
    const { showAuthOverlay } = useAuth();

    const {
        needsMetaMask,
        connectWallet,
        initialized,
        connecting,
        switching,
        errorMessage,
        waitingSignature,
        requiresSignature,
    } = useMetaMaskContext();

    const reference = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showAuthOverlay || reference.current === null) {
            clearAllBodyScrollLocks();
        } else {
            disableBodyScroll(reference.current);
        }
    }, [showAuthOverlay, reference]);

    const showSignMessage = useMemo(
        () => requiresSignature && !waitingSignature && errorMessage === undefined && !connecting,
        [requiresSignature, waitingSignature, errorMessage, connecting],
    );

    if (!showAuthOverlay) return <></>;

    return (
        <div
            data-testid="AuthOverlay"
            ref={reference}
            {...properties}
            className={cn(
                "fixed inset-0 z-40 flex h-screen w-screen items-center justify-center overflow-auto bg-white bg-opacity-60",
                className,
            )}
        >
            <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                    <div className="mb-1 text-theme-secondary-900">
                        <Heading
                            level={3}
                            weight="medium"
                        >
                            {t("auth.welcome")}
                        </Heading>
                    </div>

                    <p className="font-medium text-theme-secondary-700">
                        {needsMetaMask ? t("auth.wallet.install_long") : t("auth.wallet.connect_long")}
                    </p>
                </div>

                {needsMetaMask && <InstallMetamask />}

                {!needsMetaMask && (
                    <>
                        <AuthConnectWallet />

                        <div className="flex max-w-sm flex-col items-center space-y-6 px-6">
                            {errorMessage === undefined && (
                                <>
                                    {switching && <SwitchingNetwork />}

                                    {connecting && <ConnectingWallet isWaitingSignature={waitingSignature} />}

                                    {!connecting && !switching && (
                                        <ConnectWallet
                                            isWalletInitialized={initialized}
                                            shouldRequireSignature={requiresSignature}
                                            shouldShowSignMessage={showSignMessage}
                                            onConnect={() => {
                                                void connectWallet();
                                            }}
                                        />
                                    )}
                                </>
                            )}

                            {isTruthy(errorMessage) && (
                                <ConnectionError
                                    errorMessage={errorMessage}
                                    onConnect={() => {
                                        void connectWallet();
                                    }}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
