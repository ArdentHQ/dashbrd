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

    it("should use ETH as default volume currency", () => {
        const collection = new PopularCollectionFactory().create({
            volume: "0",
            volumeCurrency: undefined,
        });

        render(<NominateCollectionName collection={collection} />);

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 ETH");
    });

    it("should render the volume with the selected currency", () => {
        const collection = new PopularCollectionFactory().create({
            volume: "0",
            volumeCurrency: "BTC",
        });

        render(<NominateCollectionName collection={collection} />);

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 BTC");
    });

    it("should render 0 if collection has no volume", () => {
        const collection = new PopularCollectionFactory().create({
            volume: null,
            volumeCurrency: "BTC",
        });

        render(<NominateCollectionName collection={collection} />);

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 BTC");
    });
});
