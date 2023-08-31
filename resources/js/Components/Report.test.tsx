import { t } from "i18next";
import React from "react";
import { Report } from "./Report";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Report", () => {
    it("should render with nft", () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
            />,
        );

        expect(screen.getByTestId("Report_flag")).toBeInTheDocument();
        expect(screen.getByTestId("Report_nft")).toBeInTheDocument();
    });

    it("should render with collection", () => {
        const collection = new CollectionDetailDataFactory().create();

        render(
            <Report
                model={collection}
                modelType={"collection"}
            />,
        );

        expect(screen.getByTestId("Report_flag")).toBeInTheDocument();
        expect(screen.getByTestId("Report_collection")).toBeInTheDocument();
    });

    it("show/hide nft report modal", async () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
            />,
        );

        await userEvent.click(screen.getByTestId("Report_flag"));
        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));
        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("show/hide collection report modal", async () => {
        const collection = new CollectionDetailDataFactory().create();

        render(
            <Report
                model={collection}
                modelType={"collection"}
            />,
        );

        await userEvent.click(screen.getByTestId("Report_flag"));
        expect(screen.getByTestId("ReportModal")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));
        expect(screen.queryByTestId("ReportModal")).not.toBeInTheDocument();
    });

    it("should render with default tooltip if display default tooltip is true", async () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
                displayDefaultTooltip={true}
            />,
        );

        await userEvent.hover(screen.getByTestId("Report_flag"));
        expect(screen.getByText(t("common.report"))).toBeInTheDocument();
    });

    it("should not render with default tooltip if display default tooltip is false", async () => {
        const nft = new NftFactory().create();

        render(
            <Report
                model={nft}
                modelType={"nft"}
                displayDefaultTooltip={false}
            />,
        );

        await userEvent.hover(screen.getByTestId("Report_flag"));
        expect(screen.queryByText(t("common.report"))).not.toBeInTheDocument();
    });
});
