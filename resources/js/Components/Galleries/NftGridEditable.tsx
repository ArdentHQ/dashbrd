import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";

import { useEditableGalleryContext } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { NftSelectionHook } from "@/Components/Galleries/Hooks/useNftSelectableContext";
import { NftCollectionSlider } from "@/Components/Galleries/NftCollection/NftCollectionSlider";
import { NftGalleryCardEditable } from "@/Components/Galleries/NftGalleryCardEditable";
import { useSliderContext } from "@/Components/Slider";
import { isTruthy } from "@/Utils/is-truthy";
import { range } from "@/utils/range";

export const NftGridEditable = ({
    onChange,
    error,
    hiddenCollectionsCount,
}: {
    error?: string;
    onChange?: (selected: App.Data.Gallery.GalleryNftData[]) => void;
    hiddenCollectionsCount: number;
}): JSX.Element => {
    const { setOpen: setNftSliderOpen } = useSliderContext();
    const { nfts: galleryNfts, nftLimit } = useEditableGalleryContext();

    const [selectedNft, setSelectedNft] = useState<string | undefined>();

    const selectedNftIds = galleryNfts.selected.map((nft) => nft.id).join();

    useEffect(() => {
        onChange?.(galleryNfts.selected);
    }, [selectedNftIds]);

    const handleAdd = (): void => {
        setNftSliderOpen(true);
    };

    return (
        <div data-testid="NftGridEditable">
            <ReactSortable
                animation={200}
                setList={(list) => {
                    galleryNfts.update(list.filter((item) => isTruthy(item)));
                }}
                list={[...galleryNfts.selected]}
                tag="ul"
                className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4"
            >
                {galleryNfts.selected.map((nft) => (
                    <li
                        key={nft.id}
                        data-testid="NftGalleryCardEditable__item"
                        className="handle"
                    >
                        <NftGalleryCardEditable
                            nft={nft}
                            isSelected={selectedNft !== undefined && selectedNft === `${nft.tokenNumber}_${nft.id}`}
                            onClick={setSelectedNft}
                            onAdd={handleAdd}
                            onRemove={galleryNfts.remove}
                        />
                    </li>
                ))}

                {range(nftLimit - galleryNfts.selected.length).map((index) => (
                    <li
                        key={index}
                        data-testid="NftGalleryCardEditable__item--empty"
                    >
                        <NftGalleryCardEditable
                            isSelected={false}
                            onAdd={handleAdd}
                            error={index === 0 && galleryNfts.selected.length === 0 ? error : undefined}
                        />
                    </li>
                ))}
            </ReactSortable>

            <NftSelectionHook>
                <NftCollectionSlider hiddenCollectionsCount={hiddenCollectionsCount} />
            </NftSelectionHook>
        </div>
    );
};
