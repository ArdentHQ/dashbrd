import type { Meta } from "@storybook/react";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { ArticleCollections } from "@/Components/Articles/ArticleCard/ArticleCardContracts";
import { collections } from "./mockCollections";

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
            collections: collections,
        },
        {
            article: {
                title: "Short title",
            },
            collections: collections,
        },
        {
            article: {
                title: "A single article 1",
            },
            collections: collections.slice(0, 1),
        },
        {
            article: {
                title: "A single article 2 with a super long title that should be truncated even if it have more text than the other articles",
            },
            collections: collections.slice(0, 5),
        },
        {
            article: {
                title: "A single article 3",
            },
            collections: collections.slice(0, 2),
        },
    ],
};
