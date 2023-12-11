import React from "react";
import { CollectionName } from "@/Components/Collections/CollectionsFullTable/CollectionName";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionName", () => {
    it("should render", () => {
        const collection = new CollectionFactory().create();

        render(<CollectionName collection={collection} />);

        expect(screen.getByTestId("CollectionName")).toBeInTheDocument();
        expect(screen.getAllByTestId("Img")).toHaveLength(1);
        expect(screen.getByTestId("NetworkIcon")).toBeInTheDocument();
    });
});
