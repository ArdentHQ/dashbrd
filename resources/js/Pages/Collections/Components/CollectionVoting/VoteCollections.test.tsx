import { within } from "@testing-library/react";
import { expect } from "vitest";
import {
    VoteCollection,
    type VoteCollectionProperties,
    VoteCollections,
    VoteCount,
} from "@/Pages/Collections/Components/CollectionVoting/VoteCollections";
import PopularCollectionFactory from "@/Tests/Factories/Collections/PopularCollectionFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render, screen } from "@/Tests/testing-library";

const demoCollection: VoteCollectionProperties = {
    index: 1,
    name: "AlphaDogs",
    image: "https://i.seadn.io/gcs/files/4ef4a60496c335d66eba069423c0af90.png?w=500&auto=format",
    volume: "256.000000000000000000",
    volumeCurrency: "ETH",
    volumeDecimals: 18,
    votes: 15,
};

const collections = Array.from({ length: 8 }).fill(demoCollection) as VoteCollectionProperties[];

describe("VoteCollections", () => {
    const user = new UserDataFactory().create();

    const candidateCollections = new PopularCollectionFactory().createMany(5);
    it("should render collections in two block, 4 collection in each", () => {
        render(
            <VoteCollections
                collections={collections}
                candidateCollections={candidateCollections}
                user={user}
            />,
        );

        const leftBlock = screen.getByTestId("VoteCollections_Left");
        const rightBlock = screen.getByTestId("VoteCollections_Right");

        expect(within(leftBlock).getAllByText("AlphaDogs").length).toBe(4);
        expect(within(rightBlock).getAllByText("AlphaDogs").length).toBe(4);
    });
});
describe("VoteCollection", () => {
    it("should render the component", () => {
        render(<VoteCollection collection={demoCollection} />);

        expect(screen.getByText("AlphaDogs")).toBeInTheDocument();
    });

    it("should render volume of the collection", () => {
        render(<VoteCollection collection={demoCollection} />);

        expect(screen.getByText(/Vol: 256 ETH/)).toBeInTheDocument();
    });
});

describe("VoteCount", () => {
    it("should render without vote count", () => {
        render(<VoteCount />);

        expect(screen.getByTestId("icon-HiddenVote")).toBeInTheDocument();
    });

    it("should render with vote count", () => {
        render(<VoteCount voteCount={15} />);

        expect(screen.getByText("15")).toBeInTheDocument();
    });
});
