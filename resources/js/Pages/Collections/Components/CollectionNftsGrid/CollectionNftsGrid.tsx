import { Pagination } from "@/Components/Pagination";
import { SelectPageLimit } from "@/Components/Pagination/SelectPageLimit";
import { CollectionNft } from "@/Pages/Collections/Components/CollectionNft";

export const CollectionNftsGrid = ({
    nfts,
    onPageLimitChange,
    pageLimit,
}: {
    nfts: App.Data.Gallery.GalleryNftsData;
    onPageLimitChange: (pageLimit: number) => void;
    pageLimit: number;
}): JSX.Element => (
    <div className="flex flex-col items-center space-y-6 ">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md-lg:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {nfts.paginated.data.map((nft) => (
                <CollectionNft
                    key={nft.id}
                    nft={nft}
                />
            ))}
        </div>

        {nfts.paginated.meta.total >= 12 && (
            <div className="flex w-full flex-col items-center justify-between space-x-3 space-y-3 rounded-b border-theme-secondary-300 xs:w-auto sm:w-full sm:flex-row sm:space-y-0">
                <SelectPageLimit
                    value={pageLimit}
                    options={[12, 24, 48, 96]}
                    onChange={({ value }) => {
                        onPageLimitChange(Number(value));
                    }}
                />
                {nfts.paginated.meta.last_page > 1 && <Pagination data={nfts.paginated} />}
            </div>
        )}
    </div>
);
