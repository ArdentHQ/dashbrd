import React from "react";
import { Accordion, AccordionItem } from "./Accordion";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

describe("Accordion", () => {
    const items = [
        {
            title: "Test Header 1",
            children: <div>Test content 1</div>,
        },
        {
            title: "Test Header 2",
            children: <div>Test content 2</div>,
        },
    ];

    const headOnlyItems = [
        {
            title: "Test Header 3",
        },
        {
            title: "Test Header 4",
        },
    ];

    it("should render", () => {
        render(
            <Accordion>
                {items.map((item) => (
                    <AccordionItem
                        title={item.title}
                        key={item.title}
                    >
                        {item.children}
                    </AccordionItem>
                ))}
            </Accordion>,
        );

        expect(screen.getByTestId("Accordion")).toBeInTheDocument();
        expect(screen.queryAllByText("Test content 1")).toHaveLength(0);
        expect(screen.queryAllByText("Test content 2")).toHaveLength(0);
        expect(screen.queryAllByText("Test Header 1")).toHaveLength(1);
        expect(screen.queryAllByText("Test Header 2")).toHaveLength(1);
        expect(screen.getAllByTestId("Accordion__item")).toHaveLength(2);
    });

    it("should expand & collapse accordion on click", async () => {
        render(
            <Accordion>
                {items.map((item) => (
                    <AccordionItem
                        title={item.title}
                        key={item.title}
                    >
                        {item.children}
                    </AccordionItem>
                ))}
            </Accordion>,
        );

        expect(screen.getByTestId("Accordion")).toBeInTheDocument();
        expect(screen.queryAllByText("Test Header 1")).toHaveLength(1);
        expect(screen.queryAllByText("Test Header 2")).toHaveLength(1);
        expect(screen.getAllByTestId("Accordion__item")).toHaveLength(2);

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);

        await waitFor(() => {
            expect(screen.queryAllByText("Test content 1")).toHaveLength(1);
        });

        expect(screen.queryAllByText("Test content 2")).toHaveLength(0);

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);

        await waitFor(() => {
            expect(screen.queryAllByText("Test content 1")).toHaveLength(0);
            expect(screen.queryAllByText("Test content 2")).toHaveLength(0);
        });
    });

    it("should render head only accordion items", () => {
        render(
            <Accordion>
                {headOnlyItems.map((item) => (
                    <AccordionItem
                        title={item.title}
                        key={item.title}
                    />
                ))}
            </Accordion>,
        );

        expect(screen.getByTestId("Accordion")).toBeInTheDocument();
        expect(screen.queryAllByText("Test Header 3")).toHaveLength(1);
        expect(screen.queryAllByText("Test Header 4")).toHaveLength(1);
        expect(screen.getAllByTestId("HeadOnly_Accordion__item")).toHaveLength(2);
    });
});
