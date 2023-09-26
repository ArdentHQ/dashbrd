import React from "react";
import { ArticleCard } from "./ArticleCard";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleCard", () => {
    it("should render ", () => {
        const collections = new NFTCollectionFactory().withImage().createMany(3);

        render(
            <ArticleCard
                article={{
                    title: "title",
                }}
                collections={collections}
            />,
        );

        expect(screen.getByTestId("ArticleCard")).toBeInTheDocument();
    });
    it("should render if collections have no image", () => {
        const collections = new NFTCollectionFactory().withoutImage().createMany(3);

        render(
            <ArticleCard
                article={{
                    title: "title",
                }}
                collections={collections}
            />,
        );

        expect(screen.getByTestId("ArticleCard")).toBeInTheDocument();
    });
});
