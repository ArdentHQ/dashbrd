import React from "react";
import { NominateCollectionName } from "./NominateCollectionName";
import PopularCollectionFactory from "@/Tests/Factories/Collections/PopularCollectionFactory";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionName", () => {
    it("should render", () => {
        const collection = new PopularCollectionFactory().create();

        render(<NominateCollectionName collection={collection} />);

        expect(screen.getByTestId("NominateCollectionName")).toBeInTheDocument();
        expect(screen.getAllByTestId("Img")).toHaveLength(1);
    });
});
