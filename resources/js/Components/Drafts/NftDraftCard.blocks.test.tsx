import { NftDraftFooter } from "./NftDraftCard.blocks";
import { render, screen } from "@/Tests/testing-library";

describe("NftDraftFooter", () => {
    it("should render", () => {
        render(<NftDraftFooter />);

        expect(screen.getByTestId("NftDraftCard__Footer")).toBeInTheDocument();
    });
});
