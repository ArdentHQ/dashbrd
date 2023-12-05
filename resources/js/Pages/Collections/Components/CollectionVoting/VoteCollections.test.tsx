import { within } from "@testing-library/react";
import { expect } from "vitest";
import {
    VoteCollection,
    VoteCollections,
    VoteCount,
} from "@/Pages/Collections/Components/CollectionVoting/VoteCollections";
import VotableCollectionDataFactory from "@/Tests/Factories/Collections/VotableCollectionDataFactory";
import { render, screen } from "@/Tests/testing-library";

const demoCollection = new VotableCollectionDataFactory().create({
    name: "AlphaDogs",
    volume: "256.000000000000000000",
});

const collections = new VotableCollectionDataFactory().createMany(8, {
    name: "AlphaDogs",
});

describe("VoteCollections", () => {
    it("should render collections in two block, 4 collection in each", () => {
        render(<VoteCollections collections={collections} />);

        const leftBlock = screen.getByTestId("VoteCollections_Left");
        const rightBlock = screen.getByTestId("VoteCollections_Right");

        expect(within(leftBlock).getAllByText("AlphaDogs").length).toBe(4);
        expect(within(rightBlock).getAllByText("AlphaDogs").length).toBe(4);
    });
});
describe("VoteCollection", () => {
    it("should render the component", () => {
        render(
            <VoteCollection
                collection={demoCollection}
                index={1}
            />,
        );

        expect(screen.getByText("AlphaDogs")).toBeInTheDocument();
    });

    it("should render volume of the collection", () => {
        render(
            <VoteCollection
                collection={demoCollection}
                index={1}
            />,
        );

        expect(screen.getByText(/Vol: 256 ETH/)).toBeInTheDocument();
    });
});

describe("VoteCount", () => {
    it("should render without vote count", () => {
        render(<VoteCount voteCount={null} />);

        expect(screen.getByTestId("icon-HiddenVote")).toBeInTheDocument();
    });

    it("should render with vote count", () => {
        render(<VoteCount voteCount={15} />);

        expect(screen.getByText("15")).toBeInTheDocument();
    });
});
