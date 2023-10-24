import { useTranslation } from "react-i18next";
import { GridHeader } from "@/Components/GridHeader";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { useActiveUser } from "@/Contexts/ActiveUserContext";
import { FormatCrypto, FormatNumber } from "@/Utils/Currency";
import { toMonthYear } from "@/Utils/dates";
import { isTruthy } from "@/Utils/is-truthy";

interface CollectionHeaderBottomProperties {
    collection: App.Data.Collections.CollectionDetailData;
}

export const CollectionHeaderBottom = ({ collection }: CollectionHeaderBottomProperties): JSX.Element => {
    const { t } = useTranslation();

    const { user } = useActiveUser();

    const token: Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals"> = {
        name: "",
        symbol: collection.floorPriceCurrency ?? "",
        decimals: collection.floorPriceDecimals ?? 18,
    };

    return (
        <>
            <div
                data-testid="CollectionHeaderBottom"
                className="hide-scrollbar flex items-center justify-between space-x-2 overflow-x-auto px-6 dark:bg-theme-dark-900 md-lg:mx-auto lg:mx-0 lg:space-x-6 lg:bg-theme-secondary-100 lg:px-6 lg:py-4 dark:lg:bg-theme-dark-800"
            >
                <GridHeader
                    data-testid="CollectionHeaderBottom__floor"
                    className="lg:border-r lg:border-theme-secondary-300 lg:pl-0 lg:pr-6 dark:lg:border-theme-dark-700"
                    title={t("common.floor")}
                    value={
                        <FormatCrypto
                            value={collection.floorPrice ?? "0"}
                            token={token}
                        />
                    }
                />

                <GridHeader
                    data-testid="CollectionHeaderBottom__volume"
                    className="lg:border-r lg:border-theme-secondary-300 lg:pl-0 lg:pr-6 dark:lg:border-theme-dark-700"
                    title={t("common.volume", { frequency: "" })}
                    value={
                        <FormatCrypto
                            value={collection.volume ?? "0"}
                            token={token}
                        />
                    }
                />

                <GridHeader
                    data-testid="CollectionHeaderBottom__supply"
                    className="lg:border-r lg:border-theme-secondary-300 lg:pl-0 lg:pr-6 dark:lg:border-theme-dark-700"
                    title={t("common.supply")}
                    value={isTruthy(collection.supply) ? <FormatNumber value={collection.supply} /> : null}
                />

                <GridHeader
                    data-testid="CollectionHeaderBottom__owners"
                    className="lg:border-r lg:border-theme-secondary-300 lg:pl-0 lg:pr-6 dark:lg:border-theme-dark-700"
                    title={t("common.owners")}
                    value={isTruthy(collection.owners) ? <FormatNumber value={collection.owners} /> : null}
                />

                <GridHeader
                    data-testid="CollectionHeaderBottom__created"
                    className="lg:px-0"
                    title={t("common.created")}
                    value={
                        // User can be null when useEffect has not been triggered yet
                        // to set the ActiveUserContext, see https://app.clickup.com/t/861naue4m
                        collection.mintedAt !== null && isTruthy(user)
                            ? toMonthYear(collection.mintedAt, user.attributes)
                            : null
                    }
                />

                <div className="flex lg:flex-1 lg:justify-end">
                    <GridHeader
                        data-testid="CollectionHeaderBottom__chain"
                        className="w-full lg:w-auto lg:pr-0 lg:text-right"
                        title={t("common.chain")}
                        value={
                            <NetworkIcon
                                className="lg:flex-row-reverse lg:space-x-0"
                                textClassName="lg:pr-2"
                                networkId={collection.chainId}
                                withoutTooltip
                            />
                        }
                    />
                </div>
            </div>
        </>
    );
};
