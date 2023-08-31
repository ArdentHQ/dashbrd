import { expect } from "vitest";
import { Explorer } from "./explorer.service";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import NetworkFeesFixture from "@/Tests/Fixtures/network_fees.json";
import TokenTransactionsFixture from "@/Tests/Fixtures/token_transactions.json";
import { requestMock, server } from "@/Tests/Mocks/server";
import { type FeesData } from "@/Utils/api.contracts";
import { purgeCacheByAddress } from "@/Utils/Explorer/explorer.transactions.service";

vi.mock("@/Utils/sleep", () => ({
    sleep: vi.fn(),
}));

describe("Explorer", () => {
    beforeEach(() => {
        server.use(
            requestMock("https://api.polygonscan.com/api", TokenTransactionsFixture, {
                method: "get",
            }),
            requestMock("https://api.etherscan.io/api", TokenTransactionsFixture, {
                method: "get",
            }),
        );
    });

    it("should throw if api fails", async () => {
        server.resetHandlers();

        server.use(
            requestMock("https://api.polygonscan.com/api", "Error", {
                status: 500,
            }),
        );

        const explorer = new Explorer(137);

        await expect(
            async () => await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e"),
        ).rejects.toThrow();
    });

    it("should throw if api not status 200", async () => {
        server.resetHandlers();

        server.use(
            requestMock("https://api.polygonscan.com/api", "Error", {
                status: 400,
            }),
        );

        const explorer = new Explorer(137);

        await expect(
            async () => await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e"),
        ).rejects.toThrow();
    });

    it("should retry on rate limit error", async () => {
        server.resetHandlers();

        server.use(
            requestMock(
                "https://api.polygonscan.com/api",
                {
                    status: "0",
                    result: "rate limit",
                },
                {
                    status: 500,
                },
            ),
        );

        const explorer = new Explorer(137);

        await expect(
            async () => await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e"),
        ).rejects.toThrow();
    });

    it("should retry on rate limit error (when status 200)", async () => {
        server.resetHandlers();

        server.use(
            requestMock(
                "https://api.polygonscan.com/api",
                {
                    status: "0",
                    result: "rate limit",
                },
                {
                    status: 200,
                },
            ),
        );

        const explorer = new Explorer(137);

        await expect(
            async () => await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e"),
        ).rejects.toThrow();
    });

    it("should return empty transactions array if errored", async () => {
        server.resetHandlers();

        server.use(
            requestMock(
                "https://api.polygonscan.com/api",
                {
                    status: "0",
                    result: "test",
                },
                {
                    status: 200,
                },
            ),
        );

        const explorer = new Explorer(137);

        await expect(
            explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e"),
        ).resolves.toStrictEqual([]);
    });

    it("should fetch token transactions from etherscan", async () => {
        const explorer = new Explorer(1);
        const transactions = await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e");
        expect(transactions).toHaveLength(20);
    });

    it("should fetch token transactions from polygonscan", async () => {
        const asset = new TokenListItemDataFactory().create({
            chain_id: 137,
            is_native_token: true,
        });
        const explorer = new Explorer(137);
        const transactions = await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e", asset);
        expect(transactions).toHaveLength(20);
    });

    it("should fetch token transactions from polygonscan if not native token", async () => {
        const asset = new TokenListItemDataFactory().create({
            chain_id: 137,
            is_native_token: false,
        });
        const explorer = new Explorer(137);
        const transactions = await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e", asset);
        expect(transactions).toHaveLength(20);
    });

    it("should throw if chain is is not supported", () => {
        expect(() => new Explorer(1000)).toThrow();
    });

    it("should read from cache", async () => {
        const explorer = new Explorer(1);

        let transactions = await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e");

        expect(transactions).toHaveLength(20);

        const response = {
            ...TokenTransactionsFixture,
            result: TokenTransactionsFixture.result.slice(0, 2),
        };

        server.use(
            requestMock("https://api.etherscan.io/api", response, {
                method: "get",
            }),
        );

        transactions = await explorer.transactionsByAddress("0x9aa99c23f67c81701c772b106b4f83f6e858dd2e");

        expect(transactions).toHaveLength(20);
    });

    it.each([
        ["0x9aa99c23f67c81701c772b106b4f83f6e858dd2e", false],
        ["0xbaa99c23fc2c81701c772b106b4f83f6e858dd2e", true],
    ])("should purge the cache", async (address, isNativeToken) => {
        const explorer = new Explorer(1);

        const asset = new TokenListItemDataFactory().create({
            chain_id: 137,
            is_native_token: isNativeToken,
            address,
        });

        let transactions = await explorer.transactionsByAddress(address, asset);

        expect(transactions).toHaveLength(20);

        const response = {
            ...TokenTransactionsFixture,
            result: TokenTransactionsFixture.result.slice(0, 2),
        };

        purgeCacheByAddress(address, isNativeToken);

        server.use(
            requestMock("https://api.etherscan.io/api", response, {
                method: "get",
            }),
        );

        transactions = await explorer.transactionsByAddress(address, asset);

        expect(transactions).toHaveLength(2);
    });
});

describe("Fees", () => {
    const feesMockData: FeesData = {
        LastBlock: "45029317",
        SafeGasPrice: "139",
        ProposeGasPrice: "165.3",
        FastGasPrice: "171.8",
        suggestBaseFee: "108.960256899",
        gasUsedRatio: "0.551313966666667,0.4694098,0.582869,0.344308733333333,0.5527482",
        UsdPrice: "0.63877",
    };

    beforeEach(() => {
        server.use(
            requestMock(
                "https://api.polygonscan.com/api",
                { ...NetworkFeesFixture, result: { ...NetworkFeesFixture.result, LastBlock: 1256 } },
                {
                    method: "get",
                },
            ),
        );

        server.use(
            requestMock(
                "https://api.etherscan.io/api",
                { ...NetworkFeesFixture, result: { ...NetworkFeesFixture.result, LastBlock: 91256 } },
                {
                    method: "get",
                },
            ),
        );
    });

    it("get FeesPolygonMainnet", async () => {
        const explorer = new Explorer(137);
        const result = await explorer.fees();

        expect(Object.keys(result)).toEqual(Object.keys(feesMockData));
    });

    it("get getFeesEthereumMainnet", async () => {
        const explorer = new Explorer(1);
        const result = await explorer.fees();

        expect(Object.keys(result)).toEqual(Object.keys(feesMockData));
    });

    it("should get fees from mainnet API for testnet chains", async () => {
        const explorer = new Explorer(80001);
        const result = await explorer.fees();

        expect(Object.keys(result)).toEqual(Object.keys(feesMockData));
        expect(result.LastBlock).toEqual(1256);
    });

    it("should throw if api fails", async () => {
        server.use(
            requestMock("https://api.polygonscan.com/api", "Error", {
                status: 500,
            }),
        );

        const explorer = new Explorer(137);

        await expect(async () => await explorer.fees()).rejects.toThrow();
    });

    it("should retry on rate limit error", async () => {
        server.use(
            requestMock(
                "https://api.polygonscan.com/api",
                {
                    status: "0",
                    result: "rate limit",
                },
                {
                    status: 500,
                },
            ),
        );

        const explorer = new Explorer(137);

        await expect(async () => await explorer.fees()).rejects.toThrow();
    });
});
