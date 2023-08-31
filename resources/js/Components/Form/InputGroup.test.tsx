import React from "react";
import { InputGroup } from "@/Components/Form/InputGroup";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("InputGroup", () => {
    it("should render", () => {
        render(
            <InputGroup>
                <input></input>
            </InputGroup>,
        );

        expect(screen.getByTestId("InputGroup")).toBeInTheDocument();
    });

    it("should render with function and error", () => {
        render(
            <InputGroup error="Hello World">
                {({ hasError }) => (hasError ? <span>error</span> : <span>success</span>)}
            </InputGroup>,
        );

        expect(screen.getByTestId("InputGroup")).toBeInTheDocument();

        expect(screen.getByText("error")).toBeInTheDocument();
    });

    it("should render with function without error", () => {
        render(<InputGroup>{({ hasError }) => (hasError ? <span>error</span> : <span>success</span>)}</InputGroup>);

        expect(screen.getByTestId("InputGroup")).toBeInTheDocument();

        expect(screen.getByText("success")).toBeInTheDocument();
    });

    it("should render error", () => {
        const errorMessage = "error";

        render(
            <InputGroup error={errorMessage}>
                <input></input>
            </InputGroup>,
        );

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should render hint", () => {
        const hintMessage = "hint";

        render(
            <InputGroup hint={hintMessage}>
                <input></input>
            </InputGroup>,
        );
        expect(screen.getByText(hintMessage)).toBeInTheDocument();
    });

    it("should render with label", () => {
        const labelMessage = "hint";

        render(
            <InputGroup label={labelMessage}>
                <input></input>
            </InputGroup>,
        );
        expect(screen.getByText(labelMessage)).toBeInTheDocument();
    });

    it("should render multiple hints", () => {
        const hintMessage1 = "hint";
        const hintMessage2 = "hint2";

        render(
            <InputGroup hint={[hintMessage1, hintMessage2]}>
                <input></input>
            </InputGroup>,
        );
        expect(screen.getByText(hintMessage1)).toBeInTheDocument();
        expect(screen.getByText(hintMessage2)).toBeInTheDocument();
    });

    it("should handle click", async () => {
        const onClickMock = vi.fn();
        render(
            <InputGroup onClick={onClickMock}>
                <input></input>
            </InputGroup>,
        );

        expect(screen.getByTestId("InputGroup")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("InputGroup"));

        expect(onClickMock).toHaveBeenCalled();
    });

    it("should focus on the first focusable element upon click", async () => {
        render(
            <InputGroup>
                <select data-testid="element">test</select>
            </InputGroup>,
        );

        expect(screen.getByTestId("InputGroup")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("element"));

        expect(screen.getByTestId("element")).toHaveFocus();
    });

    it("should focus upon click if element is button", async () => {
        render(
            <InputGroup>
                <button data-testid="element">test</button>
            </InputGroup>,
        );

        expect(screen.getByTestId("InputGroup")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("element"));

        expect(screen.getByTestId("element")).toHaveFocus();
    });
});
