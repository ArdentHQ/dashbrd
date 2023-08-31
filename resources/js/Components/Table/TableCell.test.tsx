import { TableCell } from "./TableCell";
import { render } from "@/Tests/testing-library";

describe("TableCell", () => {
    it("renders the cell with the default class names", () => {
        const { getByTestId } = render(
            <table>
                <tbody>
                    <tr>
                        <TableCell />
                    </tr>
                </tbody>
            </table>,
        );
        const cell = getByTestId("TableCell");
        expect(cell).toHaveClass("custom-table-cell");
    });

    it("renders the cell with custom class names", () => {
        const { getByTestId } = render(
            <table>
                <tbody>
                    <tr>
                        <TableCell className="test-class" />
                    </tr>
                </tbody>
            </table>,
        );
        const cell = getByTestId("TableCell");
        expect(cell).toHaveClass("custom-table-cell");
        expect(cell).toHaveClass("test-class");
    });

    it("renders the cell with the start variant class names", () => {
        const { getByTestId } = render(
            <table>
                <tbody>
                    <tr>
                        <TableCell variant="start" />
                    </tr>
                </tbody>
            </table>,
        );
        const cell = getByTestId("TableCell");
        expect(cell).toHaveClass("custom-table-cell");
        expect(cell.firstChild?.firstChild).toHaveClass("pl-4");
    });

    it("renders the cell with the start-list variant class names", () => {
        const { getByTestId } = render(
            <table>
                <tbody>
                    <tr>
                        <TableCell variant="start-list" />
                    </tr>
                </tbody>
            </table>,
        );
        const cell = getByTestId("TableCell");
        expect(cell.firstChild?.firstChild).toHaveClass("pl-1");
    });

    it("renders the cell with the end-list variant class names", () => {
        const { getByTestId } = render(
            <table>
                <tbody>
                    <tr>
                        <TableCell variant="end-list" />
                    </tr>
                </tbody>
            </table>,
        );
        const cell = getByTestId("TableCell");
        expect(cell.firstChild?.firstChild).toHaveClass("pr-1");
    });

    it("renders the cell with the end variant class names", () => {
        const { getByTestId } = render(
            <table>
                <tbody>
                    <tr>
                        <TableCell variant="end" />
                    </tr>
                </tbody>
            </table>,
        );
        const cell = getByTestId("TableCell");
        expect(cell.firstChild?.firstChild).toHaveClass("rounded-r");
    });
});
