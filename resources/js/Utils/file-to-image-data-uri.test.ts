import { fileToImageDataURI } from "./file-to-image-data-uri";

describe("fileToImageDataURI", () => {
    it("should return a data URI string when provided with a valid File", async () => {
        const file = new File(["Hello, World!"], "example.txt", { type: "text/plain" });

        const result = await fileToImageDataURI(file);

        expect(typeof result).toBe("string");

        expect(result.startsWith("data:text/plain;base64,")).toBe(true);
    });

    it("should reject with an error when provided with an invalid File", async () => {
        const invalidFile = null as unknown as File;

        try {
            await fileToImageDataURI(invalidFile);
        } catch (error) {
            expect(error).not.toBeNull();
        }
    });
});
