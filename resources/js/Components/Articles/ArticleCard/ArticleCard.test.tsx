import React from "react";
import { ArticleCard } from "./ArticleCard";
import ArticleDataFactory from "@/Tests/Factories/Articles/ArticleDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleCard", () => {
    const article = new ArticleDataFactory().create();

    it("should render", () => {
        render(<ArticleCard article={article} />);

        expect(screen.getByTestId("ArticleCard")).toBeInTheDocument();
    });

    it("should render large variant", () => {
        render(
            <ArticleCard
                article={article}
                variant="large"
            />,
        );

        expect(screen.getByTestId("ArticleCard")).toBeInTheDocument();
    });
});
