import React from "react";
import { CollectionHeaderTop } from "./CollectionHeaderTop";
import { MarkdownImage } from "@/Components/Collections/CollentionDescription";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import * as useAuth from "@/Hooks/useAuth";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { render, screen, userEvent } from "@/Tests/testing-library";

const collection = new CollectionDetailDataFactory().create({
    description: "This is a test collection",
    website: "https://website.com",
    twitter: "https://x.com/test",
    discord: "https://discord.gg/test",
});

describe("CollectionHeaderTop", () => {
    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(getSampleMetaMaskState());
        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("should render", () => {
        render(<CollectionHeaderTop collection={collection} />);

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__about")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__about")).not.toHaveAttribute("disabled");
        expect(screen.getByTestId("CollectionHeaderTop__image")).toBeInTheDocument();

        expect(screen.getByTestId("CollectionHeaderTop__website")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__twitter")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__discord")).toBeInTheDocument();
        expect(screen.getByTestId("Report_flag")).toBeInTheDocument();

        expect(screen.getByTestId("CollectionHeaderTop__website")).not.toHaveAttribute("disabled");
        expect(screen.getByTestId("CollectionHeaderTop__twitter")).not.toHaveAttribute("disabled");
        expect(screen.getByTestId("CollectionHeaderTop__discord")).not.toHaveAttribute("disabled");
    });

    it("should disable about link if no description", () => {
        render(
            <CollectionHeaderTop
                collection={{
                    ...collection,
                    description: null,
                }}
            />,
        );

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__about")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__about")).toHaveAttribute("disabled");
    });

    it("should open and close description modal", async () => {
        render(
            <CollectionHeaderTop
                collection={{
                    ...collection,
                    description: `This contains **bold** text, _italic_ text,  [links](https://inline.com), [**bold links**](https://inline-bold.com).

            <div>Example HTML</div>

            All ![images](https://example.com) and ![again images](https://example.com) should be ignored.

            This will contain inline link: https://autolink.com

            > This is a blockquote that should be ignored.`,
                }}
            />,
        );

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__about")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionHeaderTop__description_modal")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionHeaderTop__about"));

        expect(screen.getByTestId("CollectionHeaderTop__description_modal")).toBeInTheDocument();

        const html = screen.getByTestId("CollectionHeaderTop__html");

        // Ignores images...
        expect(html.innerHTML).toContain("![images](https://example.com)");
        expect(html.innerHTML).toContain("![again images](https://example.com)");

        // Processes links...
        expect(html.innerHTML).toContain(`data-testid="Link__anchor"`);

        await userEvent.click(screen.getByTestId("Dialog__close").getElementsByTagName("button")[0]);

        expect(screen.queryByTestId("CollectionHeaderTop__description_modal")).not.toBeInTheDocument();
    });

    it("processes markdown image", () => {
        render(
            <MarkdownImage
                alt="Test"
                src="https://example.com"
            />,
        );
    });

    it("should not display description if description is not specified", async () => {
        render(
            <CollectionHeaderTop
                collection={{
                    ...collection,
                    description: null,
                }}
            />,
        );

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__about")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionHeaderTop__description_modal")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("CollectionHeaderTop__about"));

        expect(screen.queryByTestId("CollectionHeaderTop__description_modal")).not.toBeInTheDocument();
    });

    it("should handle no social links", () => {
        const collection = new CollectionDetailDataFactory().create({
            website: "",
            twitter: null,
            discord: null,
        });

        render(<CollectionHeaderTop collection={collection} />);

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__website")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__twitter")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__discord")).toBeInTheDocument();
        expect(screen.getByTestId("Report_flag")).toBeInTheDocument();

        expect(screen.getByTestId("CollectionHeaderTop__website")).toHaveAttribute("disabled");
        expect(screen.getByTestId("CollectionHeaderTop__twitter")).toHaveAttribute("disabled");
        expect(screen.getByTestId("CollectionHeaderTop__discord")).toHaveAttribute("disabled");
    });

    it("should open and close the report modal", async () => {
        render(<CollectionHeaderTop collection={collection} />);

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Report_flag"));

        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Dialog__close").getElementsByTagName("button")[0]);

        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("should disable reporting", () => {
        render(
            <CollectionHeaderTop
                collection={collection}
                allowReport={false}
            />,
        );

        expect(screen.getByTestId("Report_flag")).toHaveAttribute("disabled");
    });

    it("should disable reporting if already reported", () => {
        render(
            <CollectionHeaderTop
                collection={collection}
                alreadyReported
            />,
        );

        expect(screen.getByTestId("Report_flag")).toHaveAttribute("disabled");
    });

    it("should disable reporting if throttled message", () => {
        render(
            <CollectionHeaderTop
                collection={collection}
                reportAvailableIn="1 minute"
            />,
        );

        expect(screen.getByTestId("Report_flag")).toHaveAttribute("disabled");
    });

    it("should use polygon url for address", () => {
        const collection = new CollectionDetailDataFactory().create({
            chainId: 137,
        });

        render(<CollectionHeaderTop collection={collection} />);

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__address")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__address")).toHaveAttribute(
            "href",
            `https://polygonscan.com/address/${collection.address}`,
        );
    });

    it("should use ethereum url for address", () => {
        const collection = new CollectionDetailDataFactory().create({
            chainId: 1,
        });

        render(<CollectionHeaderTop collection={collection} />);

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__address")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderTop__address")).toHaveAttribute(
            "href",
            `https://etherscan.io/address/${collection.address}`,
        );
    });

    it("should handle missing image", () => {
        process.env.REACT_APP_IS_UNIT = "false";

        const collection = new CollectionDetailDataFactory().create({
            image: null,
        });

        render(<CollectionHeaderTop collection={collection} />);

        expect(screen.getByTestId("CollectionHeaderTop")).toBeInTheDocument();
        expect(screen.getByTestId("ImageErrorPlaceholer")).toBeInTheDocument();

        process.env.REACT_APP_IS_UNIT = "true";
    });
});
