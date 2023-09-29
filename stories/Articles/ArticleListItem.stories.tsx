import type { Meta } from "@storybook/react";
import { ArticleListItem } from "@/Components/Articles/ArticleListItem";
import { ArticleCollections } from "@/Components/Articles/ArticleCard/ArticleCardContracts";
import {collections} from "./mockCollections";

export default {
    title: "Articles/ArticleListItem",
} as Meta<typeof ArticleListItem>;

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
            collections: collections.slice(0, 5)
        },
        {
            article: {
                title: "A single article 3",
            },
            collections: collections.slice(0, 2)
        },
    ]
};
