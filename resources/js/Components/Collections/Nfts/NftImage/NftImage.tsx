import { useTranslation } from "react-i18next";
import { GalleryCard } from "@/Components/Galleries/GalleryPage/GalleryCard";
import { Img } from "@/Components/Image";

interface Properties {
    nft: App.Data.Nfts.NftData;
}

export const NftImage = ({ nft }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const { large: largeImage, original, originalRaw } = nft.images;
    const originalNftImage = original ?? originalRaw ?? largeImage;

    const handleClick = (): void => {
        window.open(originalNftImage as string, "_blank");
    };

    return (
        <>
            <GalleryCard
                className="w-full max-w-[44rem] !rounded-none md:!rounded-xl lg:w-[400px]"
                isSelected={false}
                fixedOnMobile
            >
                <div
                    className="group relative h-full cursor-zoom-in overflow-hidden md:rounded-lg"
                    onClick={handleClick}
                >
                    {largeImage != null && (
                        <Img
                            data-testid="NftImage__image"
                            src={largeImage}
                            wrapperClassName="aspect-square"
                            alt={t("pages.nfts.nft")}
                        />
                    )}
                </div>
            </GalleryCard>
        </>
    );
};
