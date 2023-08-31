import { browserLocale } from "@/Utils/browser-locale";

describe("browserLocale", () => {
    it("should return locale from navigator.languages", () => {
        const navigatorSpy = vi.spyOn(navigator, "languages", "get").mockReturnValue(["de-DE", "de"]);

        expect(browserLocale()).toEqual("de-DE");

        navigatorSpy.mockRestore();
    });

    it("should return locale from navigator.language", () => {
        const navigatorSpy = vi.spyOn(window.navigator, "language", "get").mockReturnValue("en-GB");
        vi.spyOn(window.navigator, "languages", "get").mockReturnValueOnce([]);

        expect(browserLocale()).toEqual("en-GB");

        navigatorSpy.mockRestore();
    });
});
