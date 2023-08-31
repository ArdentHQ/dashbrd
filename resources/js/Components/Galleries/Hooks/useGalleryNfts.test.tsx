import { useGalleryNtfs } from "./useGalleryNtfs";
import { renderHook } from "@/Tests/testing-library";

describe("useGalleryNtfs", () => {
    it("should throw on search if first page url is not defined", async () => {
        const { result } = renderHook(() =>
            useGalleryNtfs({
                nfts: [],
            }),
        );

        await expect(async () => {
            await result.current.searchNfts("test");
        }).rejects.toThrowError("[searchNfts] First page url is not defined.");
    });
});
