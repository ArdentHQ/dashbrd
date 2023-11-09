import { ArticleErrorImage } from "./ArticleErrorImage";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleErrorImage", () => {
    it("should render", () => {
        render(<ArticleErrorImage />);

        expect(screen.getByTestId("ArticleErrorImage")).toBeInTheDocument();
    });

    it("should render for large article variant", () => {
        render(<ArticleErrorImage isLargeVariant />);

        expect(screen.getByTestId("ArticleErrorImageLargeVariant")).toBeInTheDocument();
    });
});
