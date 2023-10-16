import cn from "classnames";
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
import { useDarkModeContext } from "@/Contexts/DarkModeContex";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuth } from "@/Hooks/useAuth";
import { AuthConnectWallet, AuthConnectWalletDark, AuthInstallWallet } from "@/images";
import { isTruthy } from "@/Utils/is-truthy";

export const AuthOverlay = ({
    show,
    closeOverlay,
    showCloseButton,
    showBackButton,
    mustBeSigned = false,
    sessionMayExpired = false,
    ...properties
}: AuthOverlayProperties): JSX.Element => {
    const { t } = useTranslation();
    const { isDark } = useDarkModeContext();

    const { signed } = useAuth();

    const {
        needsMetaMask,
        connectWallet,
        signWallet,
        initialized,
        connecting,
        signing,
        switching,
        errorMessage,
        waitingSignature,
        requiresSignature: metaMaskRequiresSignature,
    } = useMetaMaskContext();

    const requiresSignature = (mustBeSigned && !signed) || metaMaskRequiresSignature;

    const showSignMessage = metaMaskRequiresSignature && !waitingSignature && errorMessage === undefined && !connecting;

    return (
        <Overlay
            data-testid="AuthOverlay"
            {...properties}
            showOverlay={show}
            showCloseButton={showCloseButton}
        >
            <div className="px-5 text-center xs:px-8">
                <div className="mb-1 text-theme-secondary-900 dark:text-theme-dark-50">
                    <Heading
                        level={3}
                        weight="medium"
                    >
                        {t("auth.welcome")}
                    </Heading>
                </div>

                <p className="font-medium text-theme-secondary-700 dark:text-theme-dark-300">
                    {sessionMayExpired ? (
                        t("auth.session_timeout_modal")
                    ) : (
                        <>
                            {requiresSignature
                                ? t("auth.wallet.sign_subtitle")
                                : needsMetaMask
                                ? t("auth.wallet.install_long")
                                : t("auth.wallet.connect_long")}
                        </>
                    )}
                </p>
            </div>
            {needsMetaMask && <AuthInstallWallet />}
            {!needsMetaMask && (
                <>
                    {isDark ? (
                        <AuthConnectWalletDark data-testid="AuthOverlay__DarkModeImage" />
                    ) : (
                        <AuthConnectWallet data-testid="AuthOverlay__LightModeImage" />
                    )}
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
                            {(connecting || signing) && <ConnectingWallet signing={signing} />}
                            {!connecting && !switching && !signing && (
                                <ConnectWallet
                                    closeOverlay={closeOverlay}
                                    showCloseButton={showCloseButton}
                                    isWalletInitialized={initialized}
                                    requiresSignature={requiresSignature}
                                    showBackButton={showBackButton}
                                    onConnect={() => {
                                        void connectWallet();
                                    }}
                                    onSign={() => {
                                        void signWallet();
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {isTruthy(errorMessage) && (
                        <ConnectionError
                            closeOverlay={closeOverlay}
                            showCloseButton={showCloseButton}
                            requiresSignature={requiresSignature}
                            onConnect={() => {
                                void connectWallet();
                            }}
                            onSign={() => {
                                void signWallet();
                            }}
                        />
                    )}
                </>
            )}
        </Overlay>
    );
};
