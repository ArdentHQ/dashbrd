import { fileToImageDataURI } from "./file-to-image-data-uri";

describe("fileToImageDataURI", () => {
    it("should return a data URI string when provided with a valid File", async () => {
        const file = new File(["Hello, World!"], "example.txt", { type: "text/plain" });

        const result = await fileToImageDataURI(file);

        expect(typeof result).toBe("string");

        expect(result.startsWith("data:text/plain;base64,")).toBe(true);
    });

    it("should reject when provided with an invalid File", async () => {
        const invalidFile = null as unknown as File;

        try {
            await fileToImageDataURI(invalidFile);
        } catch (error) {
            expect(error).not.toBeNull();
        }
    });
    it("should reject with an error if invalid result", async () => {
        const file = new File(["Hello, World!"], "example.txt", { type: "text/plain" });

        const readAsBinaryStringSpy = vi.spyOn(FileReader.prototype, "result", "get").mockReturnValueOnce(null);

        try {
            await fileToImageDataURI(file);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);

            expect((error as Error).message).toBe("Failed to convert file to data URI");
        }

        readAsBinaryStringSpy.mockRestore();
    });
});
