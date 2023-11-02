import { expect } from "vitest";
import { ArticleListItemSkeleton } from "@/Components/Articles/ArticleListItem/ArticleListItemSkeleton";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleListItemSkeleton", () => {
    it("should render the element", () => {
        render(<ArticleListItemSkeleton />);

        expect(screen.getByTestId("ArticleListItemSkeleton")).toBeInTheDocument();
    });
});
