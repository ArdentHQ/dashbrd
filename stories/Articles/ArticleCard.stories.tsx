import type { Meta } from "@storybook/react";
import { ArticleCard } from "@/Components/Articles/ArticleCard";
import { collections } from "./mockCollections";

export default {
    title: "Articles/ArticleCard",
} as Meta<typeof ArticleCard>;

export const Default = {
    render: ({ sets }: { sets: App.Data.Articles.ArticleData[] }) => {
        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md-lg:grid-cols-3 xl:grid-cols-4">
                {sets.map((article, index) => (
                    <ArticleCard article={article} />
                ))}
            </div>
        );
    },
};

Default.args = {
    sets: [
        {
            title: "Japan Eyeing a Digital Transformation With NFTs and more text that should be truncated",
            slug: "japan-eyeing",
            image: "https://i.ibb.co/Wvp5cYs/image.png",
            featuredCollections: collections,
        },
        {
            title: "Short title",
            slug: "short-title",
            image: "https://i.ibb.co/Wvp5cYs/image.png",
            featuredCollections: collections,
        },
        {
            title: "A single article 1",
            slug: "a-single-article-1",
            image: "https://i.ibb.co/Wvp5cYs/image.png",
            featuredCollections: collections.slice(0, 1),
        },
        {
            title: "A single article 2 with a super long title that should be truncated even if it have more text than the other articles",
            slug: "a-single-article-2",
            image: "https://i.ibb.co/Wvp5cYs/image.png",
            featuredCollections: collections.slice(0, 5),
        },
        {
            title: "A single article 3",
            slug: "a-single-article-3",
            image: "https://i.ibb.co/Wvp5cYs/image.png",
            featuredCollections: collections.slice(0, 2),
        },
    ],
};
