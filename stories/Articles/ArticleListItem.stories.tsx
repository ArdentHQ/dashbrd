import type { Meta } from "@storybook/react";
import { ArticleListItem } from "@/Components/Articles/ArticleListItem";

export default {
    title: "Articles/ArticleListItem",
} as Meta<typeof ArticleListItem>;

export const Default = {
    render: ({
        sets,
    }: {
        sets: Array<{
            collections: Array<Pick<App.Data.Nfts.NftCollectionData, "image" | "slug">>;
            article: any;
        }>;
    }) => {
        return (
            <div>
                {sets.map(({ collections, article }, index) => (
                    <>
                        <ArticleListItem
                            collections={collections}
                            article={article}
                        />
                        <span className="block h-1 bg-theme-secondary-100 sm:h-1.5 sm:bg-transparent"></span>
                    </>
                ))}
            </div>
        );
    },
};

Default.args = {
    // TODO(@alfonsobries)[2023-09-30]. Add real article object
    sets: [
        {
            article: {
                title: "Japan Eyeing a Digital Transformation With NFTs and more text that should be truncated",
            },
            collections: [
                {
                    slug: "slug-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    slug: "slug-2",
                    image: null,
                },
                {
                    slug: "slug-3",
                    image: "https://i.seadn.io/gae/AMcucsCR-7ZeFTR2dt-v949IO-hpwUPzKSDbgiR32I-lXJHejH1D9RA-DBxylQC2-GJouUEbnBpV0qdbNZq3ssguamCxmELZO1WGoA?w=500&auto=format",
                },
            ],
        },
        {
            article: {
                title: "Short title",
            },
            collections: [
                {
                    slug: "slug-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    slug: "slug-2",
                    image: "https://i.seadn.io/gcs/files/2fcc60cfe712bf9d62a1f521e8f952ad.jpg?w=500&auto=format",
                },
                {
                    slug: "slug-3",
                    image: "https://i.seadn.io/gae/AMcucsCR-7ZeFTR2dt-v949IO-hpwUPzKSDbgiR32I-lXJHejH1D9RA-DBxylQC2-GJouUEbnBpV0qdbNZq3ssguamCxmELZO1WGoA?w=500&auto=format",
                },
            ],
        },
        {
            article: {
                title: "A single article 1",
            },
            collections: [
                {
                    slug: "slug-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
            ],
        },
        {
            article: {
                title: "A single article 2 with a super long title that should be truncated even if it have more text than the other articles",
            },
            collections: [
                {
                    slug: "slug-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    slug: "slug-3",
                    image: "https://i.seadn.io/gae/AMcucsCR-7ZeFTR2dt-v949IO-hpwUPzKSDbgiR32I-lXJHejH1D9RA-DBxylQC2-GJouUEbnBpV0qdbNZq3ssguamCxmELZO1WGoA?w=500&auto=format",
                },
            ],
        },
        {
            article: {
                title: "A single article 3",
            },
            collections: [
                {
                    slug: "slug-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    slug: "slug-3",
                    image: "https://i.seadn.io/gae/AMcucsCR-7ZeFTR2dt-v949IO-hpwUPzKSDbgiR32I-lXJHejH1D9RA-DBxylQC2-GJouUEbnBpV0qdbNZq3ssguamCxmELZO1WGoA?w=500&auto=format",
                },
            ],
        },
    ],
};
