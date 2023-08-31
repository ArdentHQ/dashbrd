import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/Components/Avatar";
import { Clipboard } from "@/Components/Clipboard";
import { Icon } from "@/Components/Icon";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const Wallet = ({ address }: { address: string }): JSX.Element => {
    const { t } = useTranslation();
    const { isXs } = useBreakpoint();

    return (
        <div className="mt-1 flex items-center">
            <Avatar address={address} />
            <p
                className="mx-3 font-medium text-theme-secondary-900"
                data-testid="Transaction__Address"
            >
                <TruncateMiddle
                    length={isXs ? 16 : 21}
                    text={address}
                />
            </p>
            <Clipboard
                tooltipTitle={t("common.copy")}
                text={address}
            >
                <Icon
                    name="Copy"
                    size="md"
                    className="cursor-pointer text-theme-hint-600"
                />
            </Clipboard>
        </div>
    );
};

export const Label = ({ children }: { children: ReactNode }): JSX.Element => (
    <span className="text-sm font-medium text-theme-secondary-500">{children}</span>
);

export const WaitingMessage = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="mt-8"
            data-testid="Transaction__WaitingMessage"
        >
            <p className="text-center text-theme-secondary-700">{t("pages.send_receive_panel.send.waiting_message")}</p>
            <div className="mt-5 flex items-center justify-center">
                <Icon
                    name="Spinner"
                    size="xl"
                    className="mr-3 animate-spin text-theme-hint-600"
                />
                <span className="font-medium text-theme-secondary-900">
                    {t("pages.send_receive_panel.send.waiting_spinner_text")}
                </span>
            </div>
        </div>
    );
};

export const FailedMessage = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="mt-8"
            data-testid="Transaction__FailedMessage"
        >
            <div className="mb-4 flex items-center justify-center">
                <div className="mr-4 h-0.5 w-12 bg-theme-secondary-300"></div>

                <Icon
                    name="FatXInCircle"
                    size="2xl"
                    className="h-15 w-15 text-theme-danger-400"
                />
                <div className="ml-4 h-0.5 w-12 bg-theme-secondary-300"></div>
            </div>
            <p className="text-center text-theme-secondary-700">{t("pages.send_receive_panel.send.failed_message")}</p>
        </div>
    );
};

export const extractTokenPriceData = (
    tokenPrices: App.Data.Token.TokenPriceLookupData,
    currency: string,
    guid: number | null,
): App.Data.CurrencyPriceData => {
    if (guid === null) {
        return { price: 0, percentChange24h: 0 };
    }

    const data = tokenPrices[`${guid}`];
    if (data === undefined) {
        return { price: 0, percentChange24h: 0 };
    }

    const rate = data[currency];
    if (rate === undefined) {
        return { price: 0, percentChange24h: 0 };
    }

    return rate;
};
