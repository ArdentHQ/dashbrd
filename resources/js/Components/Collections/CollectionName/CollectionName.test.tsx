import { CollectionName } from "./CollectionName";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionName", () => {
    const collection = {
        name: "Test Collection",
        chainId: 137 as App.Enums.Chain,
        image: "https://example.com",
    };

    it("can render", () => {
        render(<CollectionName collection={collection} />);

        expect(screen.getByTestId("CollectionName")).toBeInTheDocument();
        expect(screen.getAllByTestId("Img")).toHaveLength(1);
        expect(screen.getByTestId("NetworkIcon")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionName__detail")).not.toBeInTheDocument();
    });

    it("can render children", () => {
        render(<CollectionName collection={collection}>10 owned</CollectionName>);

        expect(screen.getByTestId("CollectionName")).toBeInTheDocument();
        expect(screen.getAllByTestId("Img")).toHaveLength(1);
        expect(screen.getByTestId("NetworkIcon")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionName__detail")).toHaveTextContent("10 owned");
    });
});
