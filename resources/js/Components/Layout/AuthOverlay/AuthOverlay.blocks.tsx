import { useTranslation } from "react-i18next";
import { type ConnectionErrorProperties, type ConnectWalletProperties } from "./AuthOverlay.contracts";
import { Button } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Icon } from "@/Components/Icon";
import { Toast } from "@/Components/Toast";
import { AuthInstallWallet } from "@/images";
const metamaskDownloadUrl = "https://metamask.io/download/";

export const InstallMetamask = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <AuthInstallWallet />

            <ButtonLink
                href={metamaskDownloadUrl}
                target="_blank"
                icon="Metamask"
                rel="noopener nofollow noreferrer"
            >
                {t("auth.wallet.install")}
            </ButtonLink>
        </>
    );
};

export const ConnectionError = ({ errorMessage, onConnect }: ConnectionErrorProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <Button onClick={onConnect}>{t("common.retry")}</Button>

            <Toast
                type="error"
                message={errorMessage}
                isExpanded
                iconDimensions={{ width: 18, height: 18 }}
            />
        </>
    );
};

export const SwitchingNetwork = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="flex items-center space-x-2"
            data-testid="AuthOverlay__switching-network"
        >
            <Icon
                name="Spinner"
                size="lg"
                className="animate-spin text-theme-hint-600"
            />
            <span className="font-medium text-theme-secondary-900">{t("auth.wallet.switching_wallet")}</span>
        </div>
    );
};

export const ConnectingWallet = ({ isWaitingSignature }: { isWaitingSignature: boolean }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <div
                className="flex items-center space-x-2"
                data-testid="AuthOverlay__connecting-network"
            >
                <Icon
                    name="Spinner"
                    size="lg"
                    className="animate-spin text-theme-hint-600"
                />
                <span className="font-medium text-theme-secondary-900">{t("auth.wallet.connecting")}</span>
            </div>

            {isWaitingSignature && (
                <Toast
                    data-testid="AuthOverlay__awaiting-signature"
                    type="info"
                    message={t("auth.wallet.connect_subtitle").toString()}
                    isExpanded
                    iconDimensions={{ width: 18, height: 18 }}
                />
            )}
        </>
    );
};

export const ConnectWallet = ({
    isWalletInitialized,
    shouldRequireSignature,
    onConnect,
    shouldShowSignMessage,
}: ConnectWalletProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <Button
                disabled={!isWalletInitialized}
                onClick={onConnect}
            >
                {shouldRequireSignature ? t("auth.wallet.sign") : t("auth.wallet.connect")}
            </Button>

            {shouldShowSignMessage && (
                <Toast
                    data-testid="AuthOverlay__sign"
                    type="info"
                    message={t("auth.wallet.requires_signature").toString()}
                    isExpanded
                    iconDimensions={{ width: 18, height: 18 }}
                />
            )}
        </>
    );
};
