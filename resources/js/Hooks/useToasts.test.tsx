import toastService from "react-hot-toast";
import { type SpyInstance } from "vitest";
import { useToasts } from "./useToasts";
import { renderHook } from "@/Tests/testing-library";

describe("useToasts", () => {
    let toastShowMock: SpyInstance;

    beforeEach(() => {
        toastShowMock = vi.spyOn(toastService, "custom").mockImplementation((callback: unknown): string => {
            if (typeof callback === "function") {
                const toastParameters = { id: "1", visible: true };
                callback(toastParameters);
            }

            return "";
        });
    });

    afterEach(() => {
        toastShowMock.mockRestore();
    });

    it("should show toast with default duration", () => {
        const { result } = renderHook(() => useToasts());

        result.current.showToast({ message: "toast message" });
        expect(toastShowMock).toHaveBeenCalledWith(expect.anything(), { duration: 5000 });
    });

    it("should show static toast", () => {
        const { result } = renderHook(() => useToasts());

        result.current.showToast({ message: "toast message", isStatic: true, isLoading: false });
        expect(toastShowMock).toHaveBeenCalledWith(expect.anything(), { duration: Number.POSITIVE_INFINITY });
    });

    it("should show loading toast", () => {
        const { result } = renderHook(() => useToasts());

        result.current.showToast({ message: "toast message", isStatic: false, isLoading: true });
        expect(toastShowMock).toHaveBeenCalledWith(expect.anything(), { duration: Number.POSITIVE_INFINITY });
    });

    it("should not show toast if message is not provided", () => {
        const { result } = renderHook(() => useToasts());

        result.current.showToast();
        expect(toastShowMock).not.toHaveBeenCalled();

        result.current.showToast({ message: null });
        expect(toastShowMock).not.toHaveBeenCalled();
    });
});
