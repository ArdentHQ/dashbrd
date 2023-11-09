import { ArticleErrorImage } from "./ArticleErrorImage";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleErrorImage", () => {
    it("should render", () => {
        render(<ArticleErrorImage />);

        expect(screen.getByTestId("ArticleErrorImage")).toBeInTheDocument();
    });
});
