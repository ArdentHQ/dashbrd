import cn from "classnames";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { CollectionDescription } from "@/Components/Collections/CollectionDescription";
import { Heading } from "@/Components/Heading";
import { type IconName } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { Marketplaces } from "@/Components/Marketplaces";
import { Point } from "@/Components/Point";
import { Report } from "@/Components/Report";
import { Tooltip } from "@/Components/Tooltip";
import { useNetwork } from "@/Hooks/useNetwork";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";

interface CollectionHeaderTopProperties {
    collection: App.Data.Collections.CollectionDetailData;
    allowReport?: boolean;
    className?: string;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
    showReportModal?: boolean;
}

interface SocialLinkProperties {
    href: string | null;
    icon: IconName;
    tooltip?: string;
}

export const SocialLink = ({ href, icon, tooltip, ...properties }: SocialLinkProperties): JSX.Element => (
    <>
        <Tooltip
            content={tooltip}
            offset={[0, 20]}
        >
            <span>
                {isTruthy(href) && (
                    <ButtonLink
                        icon={icon}
                        href={href}
                        variant="icon"
                        target="_blank"
                        {...properties}
                    />
                )}

                {!isTruthy(href) && (
                    <Button
                        icon={icon}
                        variant="icon"
                        disabled
                        {...properties}
                    />
                )}
            </span>
        </Tooltip>
    </>
);

export const CollectionHeaderTop = ({
    collection,
    allowReport = true,
    className,
    alreadyReported = false,
    reportAvailableIn = null,
    reportReasons,
    showReportModal = false,
}: CollectionHeaderTopProperties): JSX.Element => {
    const { t } = useTranslation();
    const address = formatAddress(collection.address);
    const { isPolygon, isTestnet } = useNetwork();

    const contractUrl = useMemo<string>(() => {
        if (isPolygon(collection.chainId)) {
            return isTestnet(collection.chainId)
                ? t("urls.explorers.mumbai.addresses", { address })
                : t("urls.explorers.polygonscan.addresses", { address });
        }

        return isTestnet(collection.chainId)
            ? t("urls.explorers.goerli.addresses", { address })
            : t("urls.explorers.etherscan.addresses", { address });
    }, [collection]);

    return (
        <>
            <div
                data-testid="CollectionHeaderTop"
                className={cn(
                    "flex flex-col items-center space-y-4 lg:flex-row lg:items-end lg:justify-between lg:space-y-0",
                    className,
                )}
            >
                <div className="flex flex-col items-center space-y-4 lg:flex-row lg:items-end lg:space-x-4 lg:space-y-0">
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl p-1 backdrop-blur-md">
                        <Img
                            wrapperClassName="aspect-square overflow-hidden rounded-xl h-full w-full"
                            src={collection.image ?? undefined}
                            data-testid="CollectionHeaderTop__image"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-0.5 md:space-y-2 lg:items-start">
                        <Heading level={2}>{collection.name}</Heading>

                        <div className="flex items-center text-xs font-medium md:text-sm">
                            <CollectionDescription
                                name={t("pages.collections.about_collection")}
                                description={collection.description}
                            />

                            {isTruthy(collection.openSeaSlug) && (
                                <div className="flex items-center">
                                    <div className="ml-3 mr-2">
                                        <Point />
                                    </div>

                                    <Marketplaces
                                        type="collection"
                                        chainId={collection.chainId}
                                        address={collection.address}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-x-3">
                    <SocialLink
                        data-testid="CollectionHeaderTop__website"
                        href={collection.website}
                        icon="GlobeWithCursor"
                        tooltip={t("common.website")}
                    />

                    <SocialLink
                        data-testid="CollectionHeaderTop__address"
                        href={contractUrl}
                        icon={isPolygon(collection.chainId) ? "Polygonscan" : "Etherscan"}
                        tooltip={
                            isPolygon(collection.chainId)
                                ? t("common.view_more_on_polygonscan")
                                : t("common.view_more_on_etherscan")
                        }
                    />

                    <SocialLink
                        data-testid="CollectionHeaderTop__twitter"
                        href={collection.twitter}
                        icon="Twitter"
                        tooltip={t("common.twitter")}
                    />

                    <SocialLink
                        data-testid="CollectionHeaderTop__discord"
                        href={collection.discord}
                        icon="Discord"
                        tooltip={t("common.discord")}
                    />

                    <Report
                        reportReasons={reportReasons}
                        model={collection}
                        modelType={"collection"}
                        alreadyReported={alreadyReported}
                        reportAvailableIn={reportAvailableIn}
                        allowReport={allowReport}
                        tooltipOffset={[0, 20]}
                        displayDefaultTooltip
                        show={showReportModal}
                    />
                </div>
            </div>
        </>
    );
};
