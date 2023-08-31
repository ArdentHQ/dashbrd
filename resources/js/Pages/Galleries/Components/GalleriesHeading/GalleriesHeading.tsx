import { useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { tp } from "@/Utils/TranslatePlural";

export const GalleriesHeading = ({
    galleriesCount,
    collectionsCount,
    nftsCount,
    usersCount,
}: {
    collectionsCount: number;
    galleriesCount: number;
    nftsCount: number;
    usersCount: number;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Heading level={1}>
            <span className="text-theme-hint-600">{galleriesCount}</span>
            <span className="lowercase">
                {" "}
                {tp("pages.galleries.galleries_count_simple", galleriesCount)} {t("pages.galleries.from")}{" "}
            </span>
            <span className="text-theme-hint-600">{collectionsCount}</span>
            <span> {tp("pages.galleries.collections_count_simple", collectionsCount)}, </span>
            <span className="lowercase">{t("pages.galleries.featuring")} </span>
            <span className="text-theme-hint-600">{nftsCount}</span>
            <span> {tp("pages.galleries.nfts_count_simple", nftsCount)}, </span>
            <span className="lowercase">{t("pages.galleries.curated_by")} </span>
            <span className="text-theme-hint-600">{usersCount}</span>
            <span> {tp("pages.galleries.users_count_simple", usersCount)}</span>
        </Heading>
    );
};
