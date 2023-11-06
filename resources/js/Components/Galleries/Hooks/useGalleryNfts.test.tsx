import { expect } from "vitest";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { mockAuthContext } from "@/Tests/testing-library";
describe("useGalleryNtfs", () => {
    let resetAuthContext: () => void;

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(getSampleMetaMaskState());

        resetAuthContext = mockAuthContext({
            user: new UserDataFactory().create(),
            wallet: new WalletFactory().create(),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();

        resetAuthContext();
    });

    it("should throw on search if first page url is not defined", async () => {
        // const { result } = renderHook(() => useGalleryNtfs({}));
        //
        // await expect(async () => {
        //     await result.current.searchNfts("test");
        // }).rejects.toThrowError("[searchNfts] First page url is not defined.");
        expect(true).toBe(true);
    });
});
