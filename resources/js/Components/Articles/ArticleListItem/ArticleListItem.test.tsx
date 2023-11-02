import React from "react";
import { ArticleListItem } from "./ArticleListItem";
import ArticleDataFactory from "@/Tests/Factories/Articles/ArticleDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleListItem", () => {
    const article = new ArticleDataFactory().create();

    it("should render ", () => {
        render(<ArticleListItem article={article} />);

        expect(screen.getByTestId("ArticleListItem")).toBeInTheDocument();
    });
});
