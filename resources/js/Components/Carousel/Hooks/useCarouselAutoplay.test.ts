import { renderHook } from "@testing-library/react-hooks";

import { useCarouselAutoplay } from "./useCarouselAutoplay";

describe("useCarouselAutoplay", () => {
    it("should stay idle if carousel instance is not provided", () => {
        const { result } = renderHook(() => useCarouselAutoplay({ carouselInstance: undefined }));

        expect(result.current.activeIndex).toBe(0);
        expect(result.current.progress).toBe(0);
    });
});
