import { scrollToTop } from "@/Utils/scroll-to-top";

describe("scrollToTop", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => null);

    it("should scroll to the top with smooth behavior", () => {
        scrollToTop();

        expect(window.scrollTo).toHaveBeenCalledWith(
            expect.objectContaining({
                top: 0,
                left: 0,
                behavior: "smooth",
            }),
        );
    });
});
