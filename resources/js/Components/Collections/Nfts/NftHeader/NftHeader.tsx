import { router } from "@inertiajs/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CollectionDescription } from "@/Components/Collections/CollentionDescription";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { Link, LinkButton } from "@/Components/Link";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Point } from "@/Components/Point";
import { useNetwork } from "@/Hooks/useNetwork";
import { formatAddress } from "@/Utils/format-address";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

interface Properties {
    nft: App.Data.Nfts.NftData;
}

export const NftHeader = ({ nft }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isPolygon } = useNetwork();
    const address = nft.wallet != null ? formatAddress(nft.wallet.address) : null;

    const ownerUrl = useMemo(() => {
        if (nft.wallet === null) {
            return null;
        }

        return t(`urls.explorers.${isPolygon(nft.collection.chainId) ? "polygonscan" : "etherscan"}.addresses`, {
            address,
        });
    }, [nft, t]);

    return (
        <>
            <div className="mb-0.5 flex items-center gap-2">
                {nft.collection.image != null && (
                    <Img
                        data-testid="NftHeader__collectionImage"
                        src={nft.collection.image}
                        alt={t("pages.nfts.collection_image")}
                        className="h-4 w-4 rounded-full"
                    />
                )}

                <LinkButton
                    data-testid="NftHeader__collectionName"
                    variant="link"
                    textColor="text-theme-hint-600"
                    fontSize="text-sm"
                    onClick={() => {
                        router.visit(
                            route("collections.view", {
                                slug: nft.collection.slug,
                            }),
                        );
                    }}
                >
                    {nft.collection.name}
                </LinkButton>
            </div>

            <Heading
                data-testid="NftHeader__heading"
                level={2}
                className="text-center lg:text-left"
            >
                {nft.name ?? nft.tokenNumber}
            </Heading>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-theme-secondary-700 md:text-sm">
                        {t("pages.nfts.owned_by") + " "}

                        {nft.wallet !== null && ownerUrl !== null && address !== null ? (
                            <Link
                                data-testid="NftHeader__walletAddress"
                                href={ownerUrl}
                                external
                                showExternalIcon={false}
                            >
                                <span className="text-theme-hint-600">
                                    <TruncateMiddle
                                        length={8}
                                        text={address}
                                    />
                                </span>
                            </Link>
                        ) : (
                            <span>{t("common.na")}</span>
                        )}
                    </p>

                    <Point />

                    <CollectionDescription
                        name={t("pages.nfts.about_nft")}
                        description={nft.collection.description}
                        linkClassName="font-medium text-xs md:text-sm"
                    />
                </div>

                <NetworkIcon
                    networkId={nft.collection.chainId}
                    className="hidden h-7 w-7 rounded-full bg-theme-secondary-100 p-1 lg:block"
                />
            </div>
        </>
    );
};
