import React from "react";
import { Listbox } from "@/Components/Form/Listbox";
import { TextInput } from "@/Components/Form/TextInput";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Listbox", () => {
    it("should render listbox with input and button", async () => {
        render(
            <Listbox
                after={
                    <Listbox.Input
                        data-testid="Listbox__input"
                        after={<TextInput.Button>Test</TextInput.Button>}
                    />
                }
            >
                <Listbox.Option
                    key={1}
                    value="value"
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        expect(screen.getByTestId("Listbox__input")).toBeInTheDocument();
        expect(screen.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("option")).toBeInTheDocument();
    });

    it("should render listbox option avatar", async () => {
        render(
            <Listbox>
                <Listbox.Avatar>
                    <div data-testid="option">value</div>
                </Listbox.Avatar>
            </Listbox>,
        );

        await userEvent.click(screen.getByTestId("Listbox__trigger"));

        expect(screen.getByTestId("ListboxAvatar")).toBeInTheDocument();
    });

    it("should accept avatar option as function", () => {
        render(
            <Listbox avatar={() => <div data-testid="custom-avatar" />}>
                <Listbox.Avatar>
                    <div data-testid="option">value</div>
                </Listbox.Avatar>
            </Listbox>,
        );

        expect(screen.getByTestId("custom-avatar")).toBeInTheDocument();
    });

    it("should render with custom button", () => {
        render(
            <Listbox button={<div data-testid="custom-button"></div>}>
                <Listbox.Avatar>
                    <div data-testid="option">value</div>
                </Listbox.Avatar>
            </Listbox>,
        );

        expect(screen.getByTestId("custom-button")).toBeInTheDocument();
    });

    it("should render with gradient button", async () => {
        render(
            <Listbox button={<Listbox.GradientButton></Listbox.GradientButton>}>
                <Listbox.Option
                    key={1}
                    value="value"
                >
                    <div data-testid="option">value</div>
                </Listbox.Option>
            </Listbox>,
        );

        expect(screen.getByTestId("ListboxGradientButton")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ListboxGradientButton"));

        expect(screen.getByTestId("option")).toBeInTheDocument();
    });
});
