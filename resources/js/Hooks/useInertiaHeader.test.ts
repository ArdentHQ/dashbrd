import { useInertiaHeader } from "./useInertiaHeader";
import { renderHook } from "@/Tests/testing-library";

vi.mock("@inertiajs/react", () => ({
    usePage: vi.fn(() => ({
        version: "1234567890",
    })),
}));

describe("useInertiaHeader", () => {
    it("should render useInertiaHeader", () => {
        const { result } = renderHook(() => useInertiaHeader());

        expect(result.current.headers).toHaveProperty("X-Inertia");
        expect(result.current.headers).toHaveProperty("X-Inertia-Version");
        expect(result.current.headers).toHaveProperty("Content-Type");
    });

    it("should return X-Inertia as true if version is not null", () => {
        const { result } = renderHook(() => useInertiaHeader());

        expect(result.current.headers["X-Inertia"]).toBe(true);
    });

    it("should return X-Inertia as false if version is null", async () => {
        const inertia = await import("@inertiajs/react");
        inertia.usePage = vi.fn().mockReturnValue({ version: null });

        const { result } = renderHook(() => useInertiaHeader());

        expect(result.current.headers["X-Inertia"]).toBe(false);
    });
});
