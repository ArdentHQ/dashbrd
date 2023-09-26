import React from "react";
import { ArticleListItem } from "./ArticleListItem";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleListItem", () => {
    it("should render ", () => {
        const collections = new NFTCollectionFactory().withImage().createMany(3);

        render(
            <ArticleListItem
                article={{
                    title: "title",
                }}
                collections={collections}
            />,
        );

        expect(screen.getByTestId("ArticleListItem")).toBeInTheDocument();
    });
    it("should render if collections have no image", () => {
        const collections = new NFTCollectionFactory().withoutImage().createMany(3);

        render(
            <ArticleListItem
                article={{
                    title: "title",
                }}
                collections={collections}
            />,
        );

        expect(screen.getByTestId("ArticleListItem")).toBeInTheDocument();
    });
});
