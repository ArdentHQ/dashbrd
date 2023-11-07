import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { type ConnectionErrorProperties, type ConnectWalletProperties } from "./AuthOverlay.contracts";
import { Button } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Icon } from "@/Components/Icon";
import { OverlayButtonsWrapper } from "@/Components/Layout/Overlay/Overlay.blocks";
import { isTruthy } from "@/Utils/is-truthy";
const metamaskDownloadUrl = "https://metamask.io/download/";

export const InstallMetamask = ({
    showCloseButton,
    closeOverlay,
}: {
    closeOverlay: () => void;
    showCloseButton: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <OverlayButtonsWrapper>
            {showCloseButton && (
                <Button
                    data-testid="AuthOverlay__close-button"
                    variant="secondary"
                    onClick={closeOverlay}
                    className="w-auto min-w-[193px] justify-center sm:w-auto xs:w-[17rem]"
                >
                    {t("common.close")}
                </Button>
            )}

            <ButtonLink
                href={metamaskDownloadUrl}
                target="_blank"
                icon="Metamask"
                rel="noopener nofollow noreferrer"
                className="w-auto min-w-[193px] justify-center sm:w-auto xs:w-[17rem]"
            >
                {t("auth.wallet.install")}
            </ButtonLink>
        </OverlayButtonsWrapper>
    );
};

export const ConnectionError = ({
    requiresSignature,
    onConnect,
    onSign,
    showCloseButton,
    closeOverlay,
}: ConnectionErrorProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <OverlayButtonsWrapper data-testid="ConnectionError">
            {showCloseButton && (
                <Button
                    data-testid="AuthOverlay__close-button"
                    variant="secondary"
                    onClick={closeOverlay}
                    className="w-full min-w-[81px] justify-center xs:w-auto"
                >
                    {t("common.close")}
                </Button>
            )}
            <Button
                className="w-full min-w-[81px] justify-center xs:w-auto"
                onClick={requiresSignature ? onSign : onConnect}
            >
                {t("common.retry")}
            </Button>
        </OverlayButtonsWrapper>
    );
};

export const SwitchingNetwork = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <OverlayButtonsWrapper data-testid="AuthOverlay__switching-network">
            <Icon
                name="Spinner"
                size="lg"
                className="animate-spin text-theme-primary-600"
            />
            <span className="font-medium text-theme-secondary-900">{t("auth.wallet.switching_wallet")}</span>
        </OverlayButtonsWrapper>
    );
};

export const ConnectingWallet = ({ signing }: { signing: boolean }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <OverlayButtonsWrapper
            data-testid="AuthOverlay__connecting-network"
            className="dark:border-theme-dark-600"
        >
            <Icon
                name="Spinner"
                size="xl"
                className="animate-spin text-theme-primary-600 dark:text-theme-primary-400"
            />
            <span className="font-medium text-theme-secondary-900 dark:text-theme-dark-50">
                {signing ? t("auth.wallet.waiting_for_signature") : t("auth.wallet.connecting")}
            </span>
        </OverlayButtonsWrapper>
    );
};

const handleBackClick = (): void => {
    if (isTruthy(document.referrer) && document.referrer.startsWith(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = "/";
    }
};

export const ConnectWallet = ({
    isWalletInitialized,
    requiresSignature,
    onConnect,
    onSign,
    showCloseButton,
    showBackButton,
    closeOverlay,
}: ConnectWalletProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <OverlayButtonsWrapper>
            {showCloseButton && (
                <Button
                    data-testid="AuthOverlay__close-button"
                    variant="secondary"
                    onClick={closeOverlay}
                    className="w-full justify-center whitespace-nowrap"
                >
                    {t("common.close")}
                </Button>
            )}

            {isTruthy(showBackButton) && !showCloseButton && (
                <Button
                    variant="secondary"
                    onClick={handleBackClick}
                    className="w-full justify-center xs:w-fit xs:px-8"
                    data-testid="AuthOverlay__back-button"
                >
                    {t("common.back")}
                </Button>
            )}

            <Button
                disabled={!isWalletInitialized}
                onClick={requiresSignature ? onSign : onConnect}
                className={classNames("justify-center", {
                    "w-full whitespace-nowrap": showCloseButton,
                    "w-full xs:w-auto": !showCloseButton,
                })}
            >
                {requiresSignature ? t("auth.wallet.sign") : t("auth.wallet.connect")}
            </Button>
        </OverlayButtonsWrapper>
    );
};
