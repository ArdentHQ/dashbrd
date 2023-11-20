import { type PageProps } from "@inertiajs/core";
import { uniqBy } from "lodash";
import React, { useMemo } from "react";
import { FeaturedCollectionsBanner } from "@/Components/FeaturedCollectionsBanner";
import { GalleryControls } from "@/Components/Galleries/GalleryPage/GalleryControls";
import { GalleryHeading } from "@/Components/Galleries/GalleryPage/GalleryHeading";
import { EditableGalleryHook } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { GalleryNfts } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { NftGridEditable } from "@/Components/Galleries/NftGridEditable";
import { GalleryNameInput } from "@/Pages/Galleries/Components/GalleryNameInput";
import { useGalleryForm } from "@/Pages/Galleries/hooks/useGalleryForm";
import { type GalleryDraftUnsaved } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import { assertUser, assertWallet } from "@/Utils/assertions";
import { isTruthy } from "@/Utils/is-truthy";

const CreateGalleryForm = ({
    gallery,
    setNfts,
    draft,
    deleteDraft,
    setTitle,
    initialNfts,
    nftLimit,
    auth,
    reportReasons,
    nftsPerPage,
    collectionsPerPage,
    hiddenCollectionsCount,
}: {
    gallery?: App.Data.Gallery.GalleryData;
    setNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    draft: GalleryDraftUnsaved;
    deleteDraft: () => void;
    setTitle: (title: string) => void;
    initialNfts?: App.Data.Gallery.GalleryNftData[];
    nftLimit: number;
    auth: PageProps["auth"];
    reportReasons: Record<string, string>;
    nftsPerPage: number;
    collectionsPerPage: number;
    hiddenCollectionsCount: number;
}): JSX.Element => {
    assertUser(auth.user);
    assertWallet(auth.wallet);

    const { selectedNfts, data, setData, errors, updateSelectedNfts } = useGalleryForm({
        gallery,
        setDraftNfts: setNfts,
        draft,
        deleteDraft,
    });

    const totalValue = 0;

    const collections = useMemo<Array<Pick<App.Data.Nfts.NftCollectionData, "name" | "image" | "slug">>>(
        () =>
            uniqBy(selectedNfts, (nft) => nft.tokenAddress).map((nft) => ({
                name: nft.collectionName,
                image: nft.collectionImage,
                slug: nft.collectionSlug,
            })),
        [selectedNfts],
    );

    return (
        <div className="mx-6 sm:mx-8 2xl:mx-0">
            <GalleryNameInput
                maxLength={50}
                error={errors.name}
                name={data.name}
                onChange={(name) => {
                    setData("name", name);
                }}
                onBlur={() => {
                    setTitle(data.name);
                }}
            />

            <EditableGalleryHook
                selectedNfts={initialNfts}
                nftLimit={nftLimit}
                key={auth.wallet.address}
            >
                <GalleryHeading
                    value={totalValue}
                    nftsCount={data.nfts.length}
                    collectionsCount={collections.length}
                    currency={auth.user.attributes.currency}
                />

                <div className="mt-4">
                    <GalleryControls
                        reportReasons={reportReasons}
                        showEditAction={false}
                        likesCount={isTruthy(gallery) ? gallery.likes : 0}
                        gallery={gallery}
                        wallet={auth.wallet}
                        isDisabled
                    />
                </div>

                <div className="space-y-4">
                    <GalleryNfts
                        nftsPerPage={nftsPerPage}
                        collectionsPerPage={collectionsPerPage}
                    >
                        <NftGridEditable
                            onChange={updateSelectedNfts}
                            error={errors.nfts}
                            hiddenCollectionsCount={hiddenCollectionsCount}
                        />
                    </GalleryNfts>

                    <FeaturedCollectionsBanner collections={collections} />
                </div>
            </EditableGalleryHook>
        </div>
    );
};

export default CreateGalleryForm;
