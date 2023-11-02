import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { GalleryCard } from "@/Components/Galleries/GalleryPage/GalleryCard";
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    nft?: App.Data.Gallery.GalleryNftData;
    isSelected: boolean;
    onClick?: (nft?: string) => void;
    onAdd?: () => void;
    onRemove?: (nft: App.Data.Gallery.GalleryNftData) => void;
    error?: string;
}

export const NftGalleryCardEditable = ({
    nft,
    isSelected,
    onClick,
    onAdd,
    onRemove,
    error,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    if (nft !== undefined && "large" in nft.images && nft.images.large !== null) {
        return (
            <GalleryCard
                className="cursor-move"
                isSelected={isSelected}
                onClick={() => onClick?.(isSelected ? undefined : `${nft.tokenNumber}_${nft.id}`)}
            >
                <GalleryCard.Overlay>
                    <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 p-1 backdrop-blur-md dark:bg-theme-dark-900/30 dark:backdrop-blur-none">
                            <IconButton
                                data-testid="NftGalleryCardEditable__add"
                                icon="Plus"
                                className="border-white outline-offset-4 dark:border-none dark:bg-theme-dark-900 dark:hover:border-theme-primary-400 dark:hover:bg-theme-primary-400 dark:hover:text-white"
                                onClick={() => {
                                    onAdd?.();
                                }}
                            />
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 p-1 backdrop-blur-md dark:bg-theme-dark-900/30 dark:backdrop-blur-none">
                            <IconButton
                                data-testid="NftGalleryCardEditable__delete"
                                icon="Trash"
                                className="outline-offset-4"
                                variant="danger"
                                onClick={() => onRemove?.(nft)}
                            />
                        </div>
                    </div>
                </GalleryCard.Overlay>

                <Img
                    errorMessage={t("common.unable_to_retrieve_image")}
                    data-testid="NftGalleryCardEditable__image"
                    wrapperClassName="aspect-square"
                    className="rounded-xl"
                    src={nft.images.large}
                />
            </GalleryCard>
        );
    }

    return (
        <Tooltip
            variant="danger"
            disabled={!isTruthy(error)}
            content={error}
            placement="bottom"
            visible={isTruthy(error)}
        >
            <div
                data-testid="NftGalleryCardEditable"
                className={classNames(
                    "transition-default group flex aspect-square cursor-pointer items-center justify-center rounded-xl border hover:outline hover:outline-3",
                    {
                        "border-theme-secondary-300 hover:outline-theme-primary-100 dark:border-theme-dark-700 dark:hover:outline-theme-dark-700":
                            !isTruthy(error),
                        "border-2 border-theme-danger-400 hover:outline-theme-danger-100": isTruthy(error),
                    },
                )}
                onClick={() => {
                    onAdd?.();
                }}
            >
                <IconButton
                    icon="Plus"
                    className="dark:hover:border-theme-primary-400 dark:hover:bg-theme-primary-400 dark:hover:text-white"
                />
            </div>
        </Tooltip>
    );
};
