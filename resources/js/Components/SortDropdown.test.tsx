import { expect } from "vitest";
import { DropdownButton, SortDropdown } from "@/Components/SortDropdown";
import { render, screen } from "@/Tests/testing-library";

describe("SortDropdown", () => {
    it("should render the component", () => {
        render(
            <SortDropdown>
                <DropdownButton
                    isActive={true}
                    onClick={vi.fn()}
                >
                    Latest
                </DropdownButton>
            </SortDropdown>,
        );

        expect(screen.getByTestId("SortDropdown")).toBeInTheDocument();
    });

    it("should render component in disabled state", () => {
        render(
            <SortDropdown disabled={true}>
                <div>hello</div>
            </SortDropdown>,
        );

        expect(screen.getByTestId("SortDropdown")).not.toBeInTheDocument();
        expect(screen.getByTestId("SortDropdown_Disabled")).toBeInTheDocument();
    });
});

describe("DropdownButton", () => {
    it("should render the component", () => {
        render(
            <DropdownButton
                onClick={vi.fn()}
                isActive={true}
            >
                <span>hello</span>
            </DropdownButton>,
        );

        expect(screen.getByTestId("DropdownButton")).toBeInTheDocument();
    });
});
