import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { useAuth } from "@/Hooks/useAuth";
import { assertUser } from "@/Utils/assertions";
import { FormatFiat, FormatNumber } from "@/Utils/Currency";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {
    token: App.Data.TokenListItemData;
}

export const TokenDetails = ({ token, ...properties }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { user } = useAuth();
    assertUser(user);

    const currency = user.attributes.currency;

    return (
        <div {...properties}>
            <Heading
                level={4}
                weight="medium"
            >
                {t("pages.token_panel.details.title")}
            </Heading>

            <dl className="mt-3 space-y-4">
                <DetailItem title={t("pages.token_panel.details.current_price")}>
                    <FormatFiat
                        user={user}
                        value={token.token_price ?? "0"}
                        currency={currency}
                    />
                </DetailItem>

                {token.total_market_cap !== null && (
                    <DetailItem
                        data-testid="TokenDetails__marketcap"
                        title={t("pages.token_panel.details.market_cap")}
                    >
                        <FormatFiat
                            user={user}
                            value={token.total_market_cap}
                            currency={currency}
                        />
                    </DetailItem>
                )}

                {token.total_volume !== null && (
                    <DetailItem
                        data-testid="TokenDetails__volume"
                        title={t("pages.token_panel.details.volume")}
                    >
                        <FormatFiat
                            user={user}
                            value={token.total_volume}
                            currency={currency}
                        />
                    </DetailItem>
                )}

                {token.minted_supply !== null && (
                    <DetailItem
                        data-testid="TokenDetails__supply"
                        title={t("pages.token_panel.details.supply")}
                    >
                        <FormatNumber value={token.minted_supply} />
                    </DetailItem>
                )}

                {token.ath !== null && (
                    <DetailItem
                        data-testid="TokenDetails__ath"
                        title={t("pages.token_panel.details.ath")}
                    >
                        <FormatFiat
                            user={user}
                            value={token.ath}
                            currency={currency}
                        />
                    </DetailItem>
                )}

                {token.atl !== null && (
                    <DetailItem
                        data-testid="TokenDetails__atl"
                        title={t("pages.token_panel.details.atl")}
                    >
                        <FormatFiat
                            user={user}
                            value={token.atl}
                            currency={currency}
                        />
                    </DetailItem>
                )}
            </dl>
        </div>
    );
};

interface DetailItemProperties extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
}

export const DetailItem = ({ title, children, ...properties }: DetailItemProperties): JSX.Element => (
    <div
        {...properties}
        className="flex items-center justify-between"
    >
        <dt className="flex leading-6 text-theme-secondary-700">{title}</dt>

        <dd className="font-medium text-theme-secondary-900">{children}</dd>
    </div>
);
