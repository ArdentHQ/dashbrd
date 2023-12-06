import React from "react";
import { NominateCollectionName } from "./NominateCollectionName";
import { type VoteCollectionProperties } from "@/Pages/Collections/Components/CollectionVoting";
import { render, screen } from "@/Tests/testing-library";

const demoCollection: VoteCollectionProperties = {
    floorPriceFiat: "45.25",
    floorPrice: "0",
    floorPriceCurrency: "ETH",
    floorPriceDecimals: 18,
    volumeFiat: 45.12,
    id: 1,
    index: 1,
    name: "AlphaDogs",
    image: "https://i.seadn.io/gcs/files/4ef4a60496c335d66eba069423c0af90.png?w=500&auto=format",
    volume: "0",
    volumeCurrency: "ETH",
    volumeDecimals: 18,
    votes: 45,
    nftsCount: 5,
};

describe("NominateCollectionName", () => {
    it("should render", () => {
        render(<NominateCollectionName collection={demoCollection} />);

        expect(screen.getByTestId("NominateCollectionName")).toBeInTheDocument();
    });

    it("should use ETH as default volume currency", () => {
        render(<NominateCollectionName collection={demoCollection} />);

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 ETH");
    });

    it("should render the volume with the selected currency", () => {
        render(<NominateCollectionName collection={{ ...demoCollection, volumeCurrency: "BTC" }} />);

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 BTC");
    });

    it("should render 0 if collection has no volume", () => {
        render(<NominateCollectionName collection={{ ...demoCollection, volume: null, volumeCurrency: "BTC" }} />);

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 BTC");
    });

    it("should render the volume using 18 decimals to format by default", () => {
        render(
            <NominateCollectionName
                collection={{
                    ...demoCollection,
                    volume: "1000000000000000000",
                    volumeCurrency: "ETH",
                    volumeDecimals: null,
                }}
            />,
        );

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("1 ETH");
    });

    it("should render the volume using the specified decimals", () => {
        render(
            <NominateCollectionName
                collection={{
                    ...demoCollection,
                    volume: "1000000000000000000",
                    volumeCurrency: "ETH",
                    volumeDecimals: 6,
                }}
            />,
        );

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("1,000,000,000,000 ETH");
    });
});