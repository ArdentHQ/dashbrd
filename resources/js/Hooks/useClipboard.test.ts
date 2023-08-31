import { useClipboard } from "./useClipboard";
import { act, renderHook, waitFor } from "@/Tests/testing-library";

describe("useClipboard", () => {
    const text = "0x0000000000000000000000000000000000";

    it("should copy to clipboard", async () => {
        const copyMock = vi.spyOn(window.navigator.clipboard, "writeText").mockImplementation(async () => {
            await Promise.resolve();
        });

        const { result } = renderHook(() => useClipboard());
        await act(async () => {
            await result.current.copy(text);
        });

        await waitFor(() => {
            expect(copyMock).toHaveBeenCalledWith(text);
        });
    });

    it("should should emit success callback upon copy", async () => {
        const onSuccessMock = vi.fn();

        const { result } = renderHook(() =>
            useClipboard({
                onSuccess: onSuccessMock,
            }),
        );

        await act(async () => {
            await result.current.copy(text);
        });

        await waitFor(() => {
            expect(onSuccessMock).toHaveBeenCalledWith(text);
        });
    });

    it("should emit error callback upon copy", async () => {
        const copyMock = vi.spyOn(window.navigator.clipboard, "writeText").mockImplementation(() => {
            throw new Error("error");
        });

        const onErrorMock = vi.fn();

        const { result } = renderHook(() =>
            useClipboard({
                onError: onErrorMock,
            }),
        );

        await act(async () => {
            await result.current.copy(text);
        });

        await waitFor(() => {
            expect(onErrorMock).toHaveBeenCalledWith();
        });

        copyMock.mockRestore();
    });

    it("should not throw if error callback is not provided", async () => {
        const copyMock = vi.spyOn(window.navigator.clipboard, "writeText").mockImplementation(() => {
            throw new Error("error message");
        });

        const onSuccessMock = vi.fn();

        const { result } = renderHook(() =>
            useClipboard({
                onSuccess: onSuccessMock,
            }),
        );

        await act(async () => {
            await result.current.copy(text);
        });

        await waitFor(() => {
            expect(onSuccessMock).not.toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(copyMock).toHaveBeenCalled();
        });

        copyMock.mockRestore();
    });

    it("should clear reset timeout upon cleanup", async () => {
        const onSuccessMock = vi.fn();

        const { result } = renderHook(() =>
            useClipboard({
                onSuccess: onSuccessMock,
                resetAfter: 1,
            }),
        );

        await act(async () => {
            await result.current.copy(text);
        });

        await waitFor(() => {
            expect(onSuccessMock).toHaveBeenCalledWith(text);
        });
    });
});
