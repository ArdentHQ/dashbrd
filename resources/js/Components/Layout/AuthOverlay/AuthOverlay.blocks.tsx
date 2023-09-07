import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { type ConnectionErrorProperties, type ConnectWalletProperties } from "./AuthOverlay.contracts";
import { Button } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Icon } from "@/Components/Icon";
import { Toast } from "@/Components/Toast";
import { AuthInstallWallet } from "@/images";
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
        <>

            <div className="flex w-full flex-col justify-center space-y-3 xs:flex-row xs:space-x-3 xs:space-y-0">
                {showCloseButton && (
                    <Button
                        data-testid="AuthOverlay__close-button"
                        variant="secondary"
                        onClick={closeOverlay}
                        className="min-w-[193px] justify-center"
                    >
                        {t("common.close")}
                    </Button>
                )}

                <ButtonLink
                    href={metamaskDownloadUrl}
                    target="_blank"
                    icon="Metamask"
                    rel="noopener nofollow noreferrer"
                    className="min-w-[193px]"
                >
                    {t("auth.wallet.install")}
                </ButtonLink>
            </div>
        </>
    );
};

export const ConnectionError = ({
    errorMessage,
    onConnect,
    showCloseButton,
    closeOverlay,
}: ConnectionErrorProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <div className="flex w-full flex-col justify-center space-y-3 xs:flex-row xs:space-x-3 xs:space-y-0">
                {showCloseButton && (
                    <Button
                        data-testid="AuthOverlay__close-button"
                        variant="secondary"
                        onClick={closeOverlay}
                        className="min-w-[81px] justify-center"
                    >
                        {t("common.close")}
                    </Button>
                )}
                <Button
                    className="min-w-[81px] justify-center"
                    onClick={onConnect}
                >
                    {t("common.retry")}
                </Button>
            </div>

            {/*<Toast*/}
            {/*    type="error"*/}
            {/*    message={errorMessage}*/}
            {/*    isExpanded*/}
            {/*    iconDimensions={{ width: 18, height: 18 }}*/}
            {/*/>*/}
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
                    size="xl"
                    className="animate-spin text-theme-hint-600"
                />
                <span className="font-medium text-theme-secondary-900">{t("auth.wallet.connecting")}</span>
            </div>

            {/*{isWaitingSignature && (*/}
            {/*    <Toast*/}
            {/*        data-testid="AuthOverlay__awaiting-signature"*/}
            {/*        type="info"*/}
            {/*        message={t("auth.wallet.connect_subtitle").toString()}*/}
            {/*        isExpanded*/}
            {/*        iconDimensions={{ width: 18, height: 18 }}*/}
            {/*    />*/}
            {/*)}*/}
        </>
    );
};

export const ConnectWallet = ({
    isWalletInitialized,
    shouldRequireSignature,
    onConnect,
    shouldShowSignMessage,
    showCloseButton,
    closeOverlay,
}: ConnectWalletProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <div className="flex w-full flex-col justify-center space-y-3 xs:flex-row xs:space-x-3 xs:space-y-0">
                {showCloseButton && (
                    <Button
                        data-testid="AuthOverlay__close-button"
                        variant="secondary"
                        onClick={closeOverlay}
                        className="w-full justify-center 1whitespace-nowrap"
                    >
                        {t("common.close")}
                    </Button>
                )}

                <Button
                    disabled={!isWalletInitialized}
                    onClick={onConnect}
                    className={classNames("justify-center", {
                        "whitespace-nowrap w-full": showCloseButton,
                    })}
                >
                    {shouldRequireSignature ? t("auth.wallet.sign") : t("auth.wallet.connect")}
                </Button>
            </div>

            {/*{shouldShowSignMessage && (*/}
            {/*    <Toast*/}
            {/*        data-testid="AuthOverlay__sign"*/}
            {/*        type="info"*/}
            {/*        message={t("auth.wallet.requires_signature").toString()}*/}
            {/*        isExpanded*/}
            {/*        iconDimensions={{ width: 18, height: 18 }}*/}
            {/*    />*/}
            {/*)}*/}
        </>
    );
};
