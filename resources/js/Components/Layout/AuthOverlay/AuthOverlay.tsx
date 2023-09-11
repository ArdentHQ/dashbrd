import cn from "classnames";
import { useMemo } from "react";
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
import { Overlay } from "@/Components/Layout/Overlay/Overlay";
import { Toast } from "@/Components/Toast";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { AuthConnectWallet, AuthInstallWallet } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

export const AuthOverlay = ({
    show,
    closeOverlay,
    showCloseButton,
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

    const showSignMessage = useMemo(
        () => requiresSignature && !waitingSignature && errorMessage === undefined && !connecting,
        [requiresSignature, waitingSignature, errorMessage, connecting],
    );

    return (
        <Overlay
            {...properties}
            showOverlay={show}
            showCloseButton={showCloseButton}
        >
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
                        className={cn("w-full flex-col items-center space-x-6 px-6", {
                            hidden: !waitingSignature && !showSignMessage && errorMessage === undefined,
                            flex: waitingSignature || showSignMessage || isTruthy(errorMessage),
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
        </Overlay>
    );
};
