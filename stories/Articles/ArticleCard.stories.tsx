import type { Meta } from "@storybook/react";
import { ArticleCard } from "@/Components/Articles/ArticleCard";

export default {
    title: "Articles/ArticleCard",
} as Meta<typeof ArticleCard>;

export const Default = {
    render: ({
        collections,
        article,
    }: {
        collections: Array<Pick<App.Data.Nfts.NftCollectionData, "image" | "slug">>;
        article: any;
    }) => {
        return (
            <ArticleCard
                collections={collections}
                article={article}
            />
        );
    },
};

Default.args = {
    // TODO(@alfonsobries)[2023-09-30]. Add a real article object
    article: null,
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
};
