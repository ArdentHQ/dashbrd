import { render, screen } from "@/Tests/testing-library";
import { ArticleErrorImage } from "./ArticleErrorImage";

describe("ArticleErrorImage", () => {
    it("should render", () => {
        render(<ArticleErrorImage />);

        expect(screen.getByTestId("ArticleErrorImage")).toBeInTheDocument();
    });
});
