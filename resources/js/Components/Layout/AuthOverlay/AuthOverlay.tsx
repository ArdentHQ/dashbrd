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
import { Toast } from "@/Components/Toast";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { AuthConnectWallet, AuthInstallWallet } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

export const AuthOverlay = ({
    className,
    showAuthOverlay,
    showCloseButton,
    closeOverlay,
    ...properties
}: AuthOverlayProperties): JSX.Element => {
    const { t } = useTranslation();

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

        return () => {
            clearAllBodyScrollLocks();
        };
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
                "fixed inset-0 z-40 mt-14 flex h-screen w-screen items-start justify-center overflow-auto bg-white xs:mt-18 sm:mt-0 sm:items-center",
                className,
                {
                    "bg-opacity-60": !showCloseButton,
                    "bg-opacity-90": showCloseButton,
                },
            )}
        >
            <div className="auth-overlay-shadow w-full rounded-none bg-white sm:w-[29rem] sm:rounded-3xl">
                <div className="mt-8 flex flex-col items-center space-y-6">
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

                    {needsMetaMask && <AuthInstallWallet />}

                    {!needsMetaMask && (
                        <>
                            <AuthConnectWallet />
                            <div
                                className={cn("w-full flex-col items-center space-x-6 px-6 xs:max-w-sm", {
                                    "ba hidden": !waitingSignature && !showSignMessage && errorMessage === undefined,
                                    "salam flex": waitingSignature || showSignMessage || isTruthy(errorMessage),
                                })}
                            >
                                {isTruthy(errorMessage) && (
                                    <Toast
                                        type="error"
                                        message={errorMessage}
                                        isExpanded
                                        iconDimensions={{ width: 18, height: 18 }}
                                    />
                                )}

                                {errorMessage === undefined && (
                                    <>
                                        {waitingSignature && (
                                            <Toast
                                                data-testid="AuthOverlay__awaiting-signature"
                                                type="info"
                                                message={t("auth.wallet.connect_subtitle").toString()}
                                                isExpanded
                                                iconDimensions={{ width: 18, height: 18 }}
                                            />
                                        )}

                                        {showSignMessage && (
                                            <Toast
                                                data-testid="AuthOverlay__sign"
                                                type="info"
                                                message={t("auth.wallet.requires_signature").toString()}
                                                isExpanded
                                                iconDimensions={{ width: 18, height: 18 }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    <div className="border-t-none w-full justify-center space-y-6 border-theme-secondary-300 px-5 pb-5 pt-0 xs:border-t xs:px-8 xs:py-5">
                        {needsMetaMask && (
                            <InstallMetamask
                                closeOverlay={closeOverlay}
                                showCloseButton={showCloseButton}
                            />
                        )}

                        {!needsMetaMask && (
                            <>
                                {errorMessage === undefined && (
                                    <div className="flex w-full flex-col items-center">
                                        {switching && <SwitchingNetwork />}
                                        {connecting && <ConnectingWallet />}
                                        {!connecting && !switching && (
                                            <ConnectWallet
                                                closeOverlay={closeOverlay}
                                                showCloseButton={showCloseButton}
                                                isWalletInitialized={initialized}
                                                shouldRequireSignature={requiresSignature}
                                                onConnect={() => {
                                                    void connectWallet();
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {isTruthy(errorMessage) && (
                                    <ConnectionError
                                        closeOverlay={closeOverlay}
                                        showCloseButton={showCloseButton}
                                        onConnect={() => {
                                            void connectWallet();
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
