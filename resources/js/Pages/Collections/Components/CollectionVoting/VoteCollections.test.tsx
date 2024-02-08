import { expect } from "vitest";
import { VoteCollection, VoteCount } from "@/Pages/Collections/Components/CollectionVoting/VoteCollections";
import VotableCollectionDataFactory from "@/Tests/Factories/Collections/VotableCollectionDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

const demoCollection = new VotableCollectionDataFactory().create({
    id: 1,
    rank: 1,
    name: "AlphaDogs",
    volume: {
        value: "256.000000000000000000",
        fiat: 0,
        currency: "ETH",
        decimals: 18,
    },
});

describe("VoteCollection", () => {
    it("should render the component", () => {
        render(
            <VoteCollection
                collection={demoCollection}
                votedId={1}
                setSelectedCollectionId={vi.fn()}
                index={1}
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
                index={1}
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
                index={1}
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
                index={1}
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
                index={1}
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
