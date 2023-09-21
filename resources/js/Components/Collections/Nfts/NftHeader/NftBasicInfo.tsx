import { router } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { LinkButton } from "@/Components/Link";

interface Properties {
    nft: App.Data.Nfts.NftData;
}

export const NftBasicInfo = ({ nft }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="flex flex-col items-center gap-0 lg:items-start"
            data-testid="NftBasicInfo__container"
        >
            <div className="flex items-center gap-2">
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
                    textColor="text-theme-primary-600"
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
        </div>
    );
};
