import { sleep } from "./sleep";

describe("sleep", () => {
    it("should resolve", async () => {
        await expect(sleep(100)).resolves.toBe(undefined);
    });
});
