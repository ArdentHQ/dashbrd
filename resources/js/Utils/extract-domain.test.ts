import { extractDomain } from "./extract-domain";

describe("extractDomain", () => {
    test("should return the domain from a given URL", () => {
        const url = "https://opensea.io/collection/thedudes";
        const expectedDomain = "opensea.io";

        const actualDomain = extractDomain(url);

        expect(actualDomain).toBe(expectedDomain);
    });

    test("should return the domain without www", () => {
        const url =
            "https://www.google.com/search?q=dashbrd&rlz=1C5CHFA_enMX1067MX1067&oq=dashbrd&gs_lcrp=EgZjaHJvbWUyBggAEEUYPDIJCAEQABgKGIAEMgYIAhBFGDkyBggDEEUYPDIGCAQQRRg8MgYIBRBFGDwyBggGEEUYPDIGCAcQRRg80gEINjg2M2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8&safe=active";
        const expectedDomain = "google.com";

        const actualDomain = extractDomain(url);

        expect(actualDomain).toBe(expectedDomain);
    });

    test("should throw an error for an invalid URL", () => {
        const url = "invalid_url";

        expect(() => {
            extractDomain(url);
        }).toThrow("Invalid URL");
    });
});
