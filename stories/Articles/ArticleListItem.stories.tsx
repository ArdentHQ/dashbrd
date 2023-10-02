import type { Meta } from "@storybook/react";
import { ArticleListItem } from "@/Components/Articles/ArticleListItem";
import { collections } from "./mockCollections";

export default {
    title: "Articles/ArticleListItem",
} as Meta<typeof ArticleListItem>;

export const Default = {
    render: ({
        sets,
    }: {
        sets: App.Data.Articles.ArticleData[];
    }) => {
        return (
            <div>
                {sets.map((article, index) => (
                    <>
                        <ArticleListItem article={article}/>
                        <span className="block h-1 bg-theme-secondary-100 sm:h-1.5 sm:bg-transparent"></span>
                    </>
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
