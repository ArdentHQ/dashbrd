import { ethers } from "ethers";
import { validateAddress } from "./validate-address";

vi.mock("ethers", () => ({
    ethers: {
        utils: {
            isAddress: vi.fn((address: string) => address),
        },
    },
}));

describe("validateAddress", () => {
    it("should validate the address correctly", () => {
        const inputAddress = "0x11f3f6b4ebdf0379b7b4ba6fe132863fddf7d63b";
        const expectedAddress = ethers.utils.isAddress(inputAddress);

        expect(validateAddress(inputAddress)).toEqual(expectedAddress);
    });

    it("should validate the non valid address", () => {
        const inputAddress = "0x11adfDASa3f6b4ebdf0379b7b4ba6fe13286xczxcasd3fddf7d63b";
        const expectedAddress = ethers.utils.isAddress(inputAddress);

        expect(validateAddress(inputAddress)).toEqual(expectedAddress);
    });
});
