import { arrayBufferToFile } from "./array-buffer-to-file";

describe("arrayBufferToFile", () => {
    it("should return a File object when provided with valid inputs", () => {
        const buffer = new ArrayBuffer(1024);
        const fileName = "example.txt";
        const fileType = "text/plain";

        const result = arrayBufferToFile(buffer, fileName, fileType);

        expect(result).toBeInstanceOf(File);
        expect(result?.name).toBe(fileName);
        expect(result?.type).toBe(fileType);
    });

    it("should return null when any input is null", () => {
        const buffer = new ArrayBuffer(1024);
        const fileName = "example.txt";
        const fileType = "text/plain";

        const result1 = arrayBufferToFile(null, fileName, fileType);
        const result2 = arrayBufferToFile(buffer, null, fileType);
        const result3 = arrayBufferToFile(buffer, fileName, null);

        expect(result1).toBeNull();
        expect(result2).toBeNull();
        expect(result3).toBeNull();
    });
});
