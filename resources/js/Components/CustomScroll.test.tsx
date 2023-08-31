import * as useResizeDetectorModule from "react-resize-detector";
import { CustomScroll } from "@/Components/CustomScroll";
import { act, render, screen, waitFor } from "@/Tests/testing-library";

describe("CustomScroll", () => {
    it("should dynamically set custom-scroll class on resize event", async () => {
        const useResizeDetectorSpy = vi
            .spyOn(useResizeDetectorModule, "useResizeDetector")
            .mockReturnValue({ ref: { current: null }, height: 500 });

        render(
            <CustomScroll>
                <div />
            </CustomScroll>,
        );

        expect(screen.getByTestId("CustomScroll")).not.toHaveClass("custom-scroll-active");

        window.innerHeight = 100;

        act(() => {
            window.dispatchEvent(new Event("resize"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("CustomScroll")).toHaveClass("custom-scroll-active");
        });

        useResizeDetectorSpy.mockRestore();
    });
});
