import React from "react";
import { Popover } from "@/Components/Popover";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Popover", () => {
    it("should open content", async () => {
        render(
            <Popover className="sm:relative">
                {({ open }) => (
                    <>
                        <Popover.Button as="div">
                            <div data-testid="Popover__button" />
                        </Popover.Button>

                        <Popover.Transition show={open}>
                            <Popover.Panel className="bg-white">
                                <div data-testid="Popover__panel" />
                            </Popover.Panel>
                        </Popover.Transition>
                    </>
                )}
            </Popover>,
        );

        expect(screen.getByTestId("Popover__button")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Popover__button"));

        expect(screen.getByTestId("Popover__panel")).toBeInTheDocument();
    });

    it("should open with custom panel classes", async () => {
        render(
            <Popover className="sm:relative">
                {({ open }) => (
                    <>
                        <Popover.Button
                            as="div"
                            className="outline-none"
                        >
                            <div data-testid="Popover__button" />
                        </Popover.Button>

                        <Popover.Transition show={open}>
                            <Popover.Panel className="lalalal">
                                <div data-testid="Popover__panel" />
                            </Popover.Panel>
                        </Popover.Transition>
                    </>
                )}
            </Popover>,
        );

        expect(screen.getByTestId("Popover__button")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Popover__button"));

        expect(screen.getByTestId("Popover__panel")).toBeInTheDocument();
    });
});
