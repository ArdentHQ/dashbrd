import React from "react";
import { CollectionFloorPrice } from "./CollectionFloorPrice";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import { SampleToken, SampleUser } from "@/Tests/SampleData";
import { render, screen } from "@/Tests/testing-library";

const collection = new CollectionFactory().create({
    floorPrice: "1000000000000000000",
});

describe("CollectionFloorPrice", () => {
    it("should render with fiat", () => {
        render(
            <CollectionFloorPrice
                collection={collection}
                token={SampleToken}
                user={SampleUser}
                fiatValue={134.5432}
            />,
        );

        expect(screen.getByTestId("CollectionFloorPrice")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__fiat")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__price-change")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toHaveTextContent("1 DARK");
        expect(screen.queryByTestId("CollectionFloorPrice__fiat")).toHaveTextContent("$134.54");
    });

    it("should handle null floor price", () => {
        const collection = new CollectionFactory().create({
            floorPrice: null,
        });
        render(
            <CollectionFloorPrice
                collection={collection}
                token={SampleToken}
                user={SampleUser}
                fiatValue={134.5432}
            />,
        );

        expect(screen.getByTestId("CollectionFloorPrice")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__fiat")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__price-change")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toHaveTextContent("0 DARK");
        expect(screen.queryByTestId("CollectionFloorPrice__fiat")).toHaveTextContent("$134.54");
    });

    it("should render with price change", () => {
        render(
            <CollectionFloorPrice
                collection={collection}
                token={SampleToken}
                percentageChange={24.57343}
            />,
        );

        expect(screen.getByTestId("CollectionFloorPrice")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__price-change")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__fiat")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toHaveTextContent("1 DARK");
        expect(screen.queryByTestId("CollectionFloorPrice__price-change")).toHaveTextContent("+24.57%");
    });

    it("should not render price change if all parameters are passed", () => {
        render(
            <CollectionFloorPrice
                collection={collection}
                token={SampleToken}
                percentageChange={24.57343}
                user={SampleUser}
                fiatValue={134.5432}
            />,
        );

        expect(screen.getByTestId("CollectionFloorPrice")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__fiat")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__price-change")).not.toBeInTheDocument();
        expect(screen.queryByTestId("CollectionFloorPrice__crypto")).toHaveTextContent("1 DARK");
        expect(screen.queryByTestId("CollectionFloorPrice__fiat")).toHaveTextContent("$134.54");
    });
});
