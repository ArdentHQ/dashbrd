import React from "react";
import { NominateCollectionName } from "./NominateCollectionName";
import VotableCollectionDataFactory from "@/Tests/Factories/Collections/VotableCollectionDataFactory";
import { render, screen } from "@/Tests/testing-library";

const demoCollection = new VotableCollectionDataFactory().create({
    floorPriceFiat: 45.25,
    floorPrice: "0",
    floorPriceCurrency: "ETH",
    floorPriceDecimals: 18,
    id: 1,
    name: "AlphaDogs",
    image: "https://i.seadn.io/gcs/files/4ef4a60496c335d66eba069423c0af90.png?w=500&auto=format",
    volume: {
        value: "0",
        currency: "ETH",
        decimals: 18,
        fiat: 45.12,
    },
    votes: 45,
    nftsCount: 5,
});

describe("NominateCollectionName", () => {
    it("should render", () => {
        render(<NominateCollectionName collection={demoCollection} />);

        expect(screen.getByTestId("NominateCollectionName")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 ETH");
    });

    it("should render 0 if collection has no volume", () => {
        render(
            <NominateCollectionName
                collection={{
                    ...demoCollection,
                    volume: {
                        value: null,
                        fiat: null,
                        currency: "ETH",
                        decimals: 18,
                    },
                }}
            />,
        );

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("0 ETH");
    });

    it("should render the volume using the specified decimals", () => {
        const volume = {
            value: "1000000000000000000",
            currency: "ETH",
            decimals: 6,
            fiat: 45.12,
        };

        render(
            <NominateCollectionName
                collection={{
                    ...demoCollection,
                    volume,
                }}
            />,
        );

        expect(screen.getByTestId("CollectionName__volume")).toHaveTextContent("1,000,000,000,000 ETH");
    });
});
