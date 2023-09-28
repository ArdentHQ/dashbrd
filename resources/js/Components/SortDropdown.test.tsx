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
});
