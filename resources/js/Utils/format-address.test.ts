import { ethers } from "ethers";
import { formatAddress } from "@/Utils/format-address";

vi.mock("ethers", () => ({
    ethers: {
        utils: {
            getAddress: vi.fn((address: string) => address), // Mock implementation simply returns the provided address
        },
    },
}));

describe("formatAddress", () => {
    test("should format the address correctly", () => {
        const inputAddress = "0x11f3f6b4ebdf0379b7b4ba6fe132863fddf7d63b";
        const expectedAddress = ethers.utils.getAddress(inputAddress);

        const formattedAddress = formatAddress(inputAddress);

        expect(formattedAddress).toBe(expectedAddress);
    });

    test("should return the same address if it's already formatted", () => {
        const inputAddress = "0x11F3f6b4Ebdf0379b7B4bA6fE132863fDDf7D63B";

        const formattedAddress = formatAddress(inputAddress);

        expect(formattedAddress).toBe(inputAddress);
    });
});
