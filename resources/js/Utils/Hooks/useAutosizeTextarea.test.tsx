import useAutosizeTextarea from "./useAutosizeTextarea";
import { renderHook } from "@/Tests/testing-library";

describe("useAutosizeTextarea", () => {
    it("should resize the textarea when the window is resized", () => {
        const reference = {
            style: {
                height: "40px",
            },
            scrollHeight: 80,
        };

        // Render the hook and simulate a resize event
        renderHook(() => {
            useAutosizeTextarea(reference as HTMLTextAreaElement, "test");
        });
        window.dispatchEvent(new Event("resize"));

        // Check that the textarea height was updated
        expect(reference.style.height).toBe("80px");
    });

    it("should do nothing if reference is null", () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener");
        const reference = null;

        renderHook(() => {
            useAutosizeTextarea(reference, "test");
        });
        window.dispatchEvent(new Event("resize"));

        // Nothing to test here, just checking that the hook doesn't throw an error
        expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    });

    it("should not resize the textarea if the scrollHeight is less than 40", () => {
        const reference = {
            style: {
                height: "40px",
            },
            scrollHeight: 20,
        };

        // Render the hook and simulate a resize event
        renderHook(() => {
            useAutosizeTextarea(reference as HTMLTextAreaElement, "test");
        });
        window.dispatchEvent(new Event("resize"));

        // Check that the textarea height was not updated
        expect(reference.style.height).toBe("40px");
    });
});
