import { t } from "i18next";
import React from "react";
import { SelectPageLimit } from "./SelectPageLimit";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("Pagination__SelectPageLimit", () => {
    it("should render default value", () => {
        render(<SelectPageLimit suffix={t("common.records")} />);

        expect(screen.getByText("Show")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("Records")).toBeInTheDocument();
    });

    it("should render with custom value", () => {
        render(
            <SelectPageLimit
                value={20}
                options={[10, 20]}
                suffix={t("common.records")}
            />,
        );

        expect(screen.getByText("Show")).toBeInTheDocument();
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText("Records")).toBeInTheDocument();
    });

    it("should select option", async () => {
        const onChangeMock = vi.fn();

        render(
            <SelectPageLimit
                onChange={onChangeMock}
                suffix={t("common.records")}
            />,
        );

        expect(screen.getByText("10")).toBeInTheDocument();

        expect(screen.getByTestId("Listbox__trigger")).toBeInTheDocument();

        await userEvent.click(screen.getByText("10"));

        expect(screen.getAllByTestId("ListboxOption")).toHaveLength(4);

        await userEvent.click(screen.getByText("25"));

        expect(screen.queryByTestId("ListboxOption")).not.toBeInTheDocument();
        expect(onChangeMock).toHaveBeenCalledWith(expect.objectContaining({ value: 25 }));
    });

    it("should render with custom suffix", () => {
        render(
            <SelectPageLimit
                value={20}
                options={[10, 20]}
                suffix={t("common.items")}
            />,
        );

        expect(screen.getByText("Show")).toBeInTheDocument();
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText("Items")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
        render(
            <SelectPageLimit
                value={20}
                options={[10, 20]}
                suffix={t("common.items")}
                className="custom-class"
            />,
        );

        expect(screen.getByTestId("Listbox")).toHaveClass("custom-class");
    });

    it("should render with custom option className", async () => {
        render(
            <SelectPageLimit
                value={20}
                options={[10, 20]}
                suffix={t("common.items")}
                optionClassName="custom-option-class"
            />,
        );

        await userEvent.click(screen.getByText("20"));

        expect(screen.getByTestId("ListboxOptions")).toBeInTheDocument();
        expect(screen.getByTestId("ListboxOptions")).toHaveClass("custom-option-class");
    });
});
