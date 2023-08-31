import cn from "classnames";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { CollectionDescription } from "@/Components/Collections/CollentionDescription";
import { Heading } from "@/Components/Heading";
import { type IconName } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { Point } from "@/Components/Point";
import { Report } from "@/Components/Report";
import { useNetwork } from "@/Hooks/useNetwork";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

interface CollectionHeaderTopProperties {
    collection: App.Data.Collections.CollectionDetailData;
    allowReport?: boolean;
    className?: string;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
}

interface SocialLinkProperties {
    href: string | null;
    icon: IconName;
}

export const SocialLink = ({ href, icon, ...properties }: SocialLinkProperties): JSX.Element => (
    <>
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
    </>
);

export const CollectionHeaderTop = ({
    collection,
    allowReport = true,
    className,
    alreadyReported = false,
    reportAvailableIn = null,
    reportReasons,
}: CollectionHeaderTopProperties): JSX.Element => {
    const { t } = useTranslation();
    const address = formatAddress(collection.address);

    const contractUrl = useMemo<string>(() => {
        const { isPolygon } = useNetwork();

        if (isPolygon(collection.chainId)) {
            return t("urls.explorers.polygonscan.addresses", { address });
        }

        return t("urls.explorers.etherscan.addresses", { address });
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
                            className="aspect-square h-30 w-30 rounded-xl bg-theme-secondary-100 object-cover"
                            src={collection.image ?? undefined}
                            data-testid="CollectionHeaderTop__image"
                        />
                    </div>

                    <div className="flex flex-col items-center space-y-0.5 md:space-y-2 lg:items-start">
                        <Heading level={2}>{collection.name}</Heading>

                        <div className="flex items-center space-x-3 text-xs font-medium md:text-sm">
                            <Link
                                data-testid="CollectionHeaderTop__address"
                                href={contractUrl}
                                className="outline-offset-3 transition-default flex items-center space-x-2 whitespace-nowrap rounded-full text-theme-hint-600 underline decoration-transparent underline-offset-2 outline-none outline-3 hover:text-theme-hint-700 hover:decoration-theme-hint-700 focus-visible:outline-theme-hint-300"
                                external
                            >
                                <span>
                                    <TruncateMiddle
                                        length={12}
                                        text={address}
                                    />
                                </span>
                            </Link>

                            <Point />

                            <CollectionDescription
                                name={t("pages.collections.about_collection")}
                                description={collection.description}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-x-3">
                    <SocialLink
                        data-testid="CollectionHeaderTop__website"
                        href={collection.website}
                        icon="GlobeWithCursor"
                    />

                    <SocialLink
                        data-testid="CollectionHeaderTop__twitter"
                        href={collection.twitter}
                        icon="Twitter"
                    />

                    <SocialLink
                        data-testid="CollectionHeaderTop__discord"
                        href={collection.discord}
                        icon="Discord"
                    />

                    <Report
                        reportReasons={reportReasons}
                        model={collection}
                        modelType={"collection"}
                        alreadyReported={alreadyReported}
                        reportAvailableIn={reportAvailableIn}
                        allowReport={allowReport}
                        tooltipOffset={[0, 20]}
                    />
                </div>
            </div>
        </>
    );
};
