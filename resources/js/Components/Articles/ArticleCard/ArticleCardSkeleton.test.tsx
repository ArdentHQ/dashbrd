import { expect } from "vitest";
import { ArticleCardSkeleton } from "@/Components/Articles/ArticleCard/ArticleCardSkeleton";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleCardSkeleton", () => {
    it("should render the element", () => {
        render(<ArticleCardSkeleton />);

        expect(screen.getByTestId("ArticleCardSkeleton")).toBeInTheDocument();
    });

    it("should render with 'more soon' text", () => {
        render(<ArticleCardSkeleton isLoading={false} />);

        expect(screen.getByText(/More Soon/i)).toBeInTheDocument();
    });
});
