import type { Meta } from "@storybook/react";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { ArticleCollections } from "@/Components/Articles/ArticleCard/ArticleCardContracts";

export default {
    title: "Articles/ArticleCard",
} as Meta<typeof ArticleCard>;

export const Default = {
    render: ({
        sets,
    }: {
        sets: Array<{
            collections: ArticleCollections;
            article: any;
        }>;
    }) => {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {sets.map(({ collections, article }, index) => (
                    <ArticleCard
                        collections={collections}
                        article={article}
                    />
                ))}
            </div>
        );
    },
};

Default.args = {
    // TODO(@alfonsobries)[2023-09-30]. Add real articles object
    sets: [
        {
            article: {
                title: "Japan Eyeing a Digital Transformation With NFTs and more text that should be truncated",
            },
            collections: [
                {
                    name: "name-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    name: "name-2",
                    image: null,
                },
                {
                    name: "name-3",
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
                    name: "name-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    name: "name-2",
                    image: "https://i.seadn.io/gcs/files/2fcc60cfe712bf9d62a1f521e8f952ad.jpg?w=500&auto=format",
                },
                {
                    name: "name-3",
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
                    name: "name-1",
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
                    name: "name-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    name: "name-3",
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
                    name: "name-1",
                    image: "https://i.seadn.io/gae/4XS5eZoT650ZUZSmJAqA5Tw6BIeZevkvZEdb1kPiB80J17GhgYclqrMVGFTnFWkI5svRElDgaPhCUVPNzg-0hbnnAU2TKsunhtVtYw?w=500&amp;auto=format",
                },
                {
                    name: "name-3",
                    image: "https://i.seadn.io/gae/AMcucsCR-7ZeFTR2dt-v949IO-hpwUPzKSDbgiR32I-lXJHejH1D9RA-DBxylQC2-GJouUEbnBpV0qdbNZq3ssguamCxmELZO1WGoA?w=500&auto=format",
                },
            ],
        },
    ],
};
