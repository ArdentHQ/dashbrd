import { within } from "@testing-library/react";
import { expect } from "vitest";
import {
    VoteCollection,
    VoteCollections,
    VoteCount,
} from "@/Pages/Collections/Components/CollectionVoting/VoteCollections";
import VotableCollectionDataFactory from "@/Tests/Factories/Collections/VotableCollectionDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

const demoCollection = new VotableCollectionDataFactory().create({
    id: 1,
    index: 1,
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
                votedId={1}
                setSelectedCollectionId={vi.fn()}
            />,
        );

        expect(screen.getByText("AlphaDogs")).toBeInTheDocument();
    });

    it("should render volume of the collection", () => {
        render(
            <VoteCollection
                collection={demoCollection}
                votedId={1}
                setSelectedCollectionId={vi.fn()}
            />,
        );

        expect(screen.getByText(/Vol: 256 ETH/)).toBeInTheDocument();
    });

    it("should render voted collection variant", () => {
        render(
            <VoteCollection
                collection={demoCollection}
                votedId={1}
                setSelectedCollectionId={vi.fn()}
                variant="voted"
            />,
        );

        expect(screen.getByTestId("icon-VotedCollectionCheckmark")).toBeInTheDocument();
    });

    it("should not select collection if user has already voted", () => {
        const selectCollectionMock = vi.fn();

        render(
            <VoteCollection
                collection={demoCollection}
                votedId={1}
                setSelectedCollectionId={selectCollectionMock}
                variant="voted"
            />,
        );

        expect(selectCollectionMock).not.toHaveBeenCalled();
    });

    it("should select the collection", async () => {
        const selectCollectionMock = vi.fn();

        render(
            <VoteCollection
                collection={demoCollection}
                setSelectedCollectionId={selectCollectionMock}
            />,
        );

        await userEvent.click(screen.getByTestId("VoteCollectionTrigger"));
        expect(selectCollectionMock).toHaveBeenCalled();
    });
});

describe("VoteCount", () => {
    it("should render without vote count", () => {
        render(
            <VoteCount
                voteCount={null}
                showVoteCount={false}
            />,
        );

        expect(screen.getByTestId("icon-HiddenVote")).toBeInTheDocument();
    });

    it("should render with vote count", () => {
        render(
            <VoteCount
                voteCount={15}
                showVoteCount={true}
            />,
        );

        expect(screen.getByText("15")).toBeInTheDocument();
    });
});
