import useOnBlurOutside from "./useOnBlurOutside";
import { renderHook } from "@/Tests/testing-library";

describe("useOnBlurOutside", () => {
    it("should call the handler when the user blurs outside the ref element", () => {
        const handler = vi.fn();

        const element = document.createElement("div");

        const anotherElement = document.createElement("button");

        renderHook(() => {
            useOnBlurOutside({ element, handler });
        });

        // Emulate focus out event on the ref element
        const event = new FocusEvent("focusout", { bubbles: true, relatedTarget: anotherElement });

        element.dispatchEvent(event);

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should call the handler when the user blurs to a null element", () => {
        const handler = vi.fn();

        const element = document.createElement("div");

        renderHook(() => {
            useOnBlurOutside({ element, handler });
        });

        // Emulate focus out event on the ref element
        const event = new FocusEvent("focusout", { bubbles: true, relatedTarget: null });

        element.dispatchEvent(event);

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not call the handler when the user blurs inside a child element", () => {
        const handler = vi.fn();

        const element = document.createElement("div");

        const childElement = document.createElement("button");

        element.appendChild(childElement);

        const reference = {
            current: element,
        };

        renderHook(() => {
            useOnBlurOutside({ element, handler });
        });

        // Emulate focus out event on the ref element
        const event = new FocusEvent("focusout", { bubbles: true, relatedTarget: childElement });

        reference.current.dispatchEvent(event);

        expect(handler).not.toHaveBeenCalled();
    });

    it("should not call the handler when hook is disabled", () => {
        const handler = vi.fn();

        const element = document.createElement("div");

        const anotherElement = document.createElement("button");

        renderHook(() => {
            useOnBlurOutside({ element, handler, enabled: false });
        });

        // Emulate focus out event on the ref element
        const event = new FocusEvent("focusout", { bubbles: true, relatedTarget: anotherElement });

        element.dispatchEvent(event);

        expect(handler).not.toHaveBeenCalled();
    });

    it("should not throw exception if element is null", () => {
        const handler = vi.fn();

        const element = null;

        renderHook(() => {
            useOnBlurOutside({ element, handler });
        });
    });
});
