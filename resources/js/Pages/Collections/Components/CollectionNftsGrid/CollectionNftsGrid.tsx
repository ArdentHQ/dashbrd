import { useTranslation } from "react-i18next";
import { Pagination } from "@/Components/Pagination";
import { SelectPageLimit } from "@/Components/Pagination/SelectPageLimit";
import { CollectionNft } from "@/Pages/Collections/Components/CollectionNft";

export const CollectionNftsGrid = ({
    nfts,
    userNfts,
    onPageLimitChange,
    pageLimit,
}: {
    nfts: App.Data.Gallery.GalleryNftsData;
    userNfts: App.Data.Collections.CollectionNftsData;
    onPageLimitChange: (pageLimit: number) => void;
    pageLimit: number;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center space-y-6 ">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md-lg:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                {nfts.paginated.data.map((nft) => (
                    <CollectionNft
                        key={nft.id}
                        nft={nft}
                        owned={userNfts.paginated.some((userNft) => userNft.id === nft.id)}
                    />
                ))}
            </div>

            {nfts.paginated.meta.total >= 12 && (
                <div className="flex w-full flex-col items-center justify-between  rounded-b border-theme-secondary-300 xs:w-auto sm:space-y-0 md:w-full md:flex-row">
                    <SelectPageLimit
                        value={pageLimit}
                        options={[12, 24, 48, 96]}
                        onChange={({ value }) => {
                            onPageLimitChange(Number(value));
                        }}
                        suffix={t("common.items")}
                    />
                    {nfts.paginated.meta.last_page > 1 && <Pagination data={nfts.paginated} />}
                </div>
            )}
        </div>
    );
};
