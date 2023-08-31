import React, { useState } from "react";
import { Slider, useSliderContext } from "@/Components/Slider";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

describe("Slider", () => {
    it("should render open", () => {
        render(
            <Slider
                isOpen
                onClose={vi.fn()}
            >
                <Slider.Header>
                    <span
                        className="text-lg font-medium leading-8"
                        data-testid="header"
                    />
                </Slider.Header>

                <Slider.Content>
                    <span data-testid="content" />
                </Slider.Content>
            </Slider>,
        );

        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("should render closed", () => {
        render(
            <Slider
                isOpen={false}
                onClose={vi.fn()}
            >
                <Slider.Header>
                    <span
                        className="text-lg font-medium leading-8"
                        data-testid="header"
                    />
                </Slider.Header>

                <Slider.Content>
                    <span data-testid="content" />
                </Slider.Content>
            </Slider>,
        );

        expect(screen.queryByTestId("header")).not.toBeInTheDocument();
        expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    it("should focus dummy div after opening", async () => {
        const Component = (): JSX.Element => {
            const [open, setOpen] = useState(false);

            return (
                <>
                    <Slider
                        isOpen={open}
                        onClose={vi.fn()}
                    >
                        <span />
                    </Slider>

                    <button
                        onClick={() => {
                            setOpen(true);
                        }}
                    >
                        open slider
                    </button>
                </>
            );
        };

        render(<Component />);

        await userEvent.click(screen.getByRole("button", { name: "open slider" }));

        await waitFor(() => {
            expect(screen.getByTestId("Slider__dummy")).toHaveFocus();
        });
    });

    it("should throw an error if not content used outside of provider", () => {
        const originalError = console.error;
        console.error = vi.fn();

        const Component = (): JSX.Element => {
            const { isOpen, setOpen } = useSliderContext();

            return (
                <>
                    <Slider
                        isOpen={isOpen}
                        onClose={vi.fn()}
                    >
                        <span />
                    </Slider>

                    <button
                        onClick={() => {
                            setOpen(true);
                        }}
                    >
                        open slider
                    </button>
                </>
            );
        };

        expect(() => render(<Component />)).toThrow("useSliderContext must be within SliderContext.Provider");

        console.error = originalError;
    });

    it("should close when clicking on slider overlay", async () => {
        const onClose = vi.fn();
        render(
            <Slider
                isOpen
                onClose={onClose}
            >
                <Slider.Header>
                    <span
                        className="text-lg font-medium leading-8"
                        data-testid="header"
                    />
                </Slider.Header>

                <Slider.Content>
                    <span data-testid="content" />
                </Slider.Content>
            </Slider>,
        );

        expect(screen.getByTestId("Slider__overlay")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Slider__overlay"));

        expect(onClose).toHaveBeenCalled();
    });
});
