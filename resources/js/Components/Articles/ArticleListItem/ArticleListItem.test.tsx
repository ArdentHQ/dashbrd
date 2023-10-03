import React from "react";
import { ArticleListItem } from "./ArticleListItem";
import FeaturedCollectionData = App.Data.Articles.FeaturedCollectionData;
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleListItem", () => {
    const collections = new NFTCollectionFactory().withImage().createMany(3) as FeaturedCollectionData[];

    const article = {
        id: 1,
        slug: "title",
        title: "title",
        image: "image",
        userId: 1,
        content: "content",
        category: "news",
        publishedAt: "23423423",
        metaDescription: "meta",
        featuredCollections: collections,
    };

    it("should render ", () => {
        render(<ArticleListItem article={article} />);

        expect(screen.getByTestId("ArticleListItem")).toBeInTheDocument();
    });
});
