import { LRUCache } from "lru-cache";
import { ExplorerClient } from "./explorer.client";
import { type ExplorerTransactionItem } from "./explorer.contracts";
import { type NetworkManifest } from "./explorer.networks";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";

const cache: LRUCache<string, App.Data.TransactionData[]> = new LRUCache<string, App.Data.TransactionData[]>({
    ttl: 60 * 1000,
    ttlAutopurge: true,
});

export const purgeCacheByAddress = (address: string, isNativeToken: boolean): void => {
    const keys = cache.keys();

    let key = keys.next();

    const matchKeyword = isNativeToken ? "txlist" : address;
    const matcher = new RegExp(`.*${matchKeyword}*`);

    while (!isTruthy(key.done)) {
        if (key.value != null && matcher.test(key.value)) {
            cache.delete(key.value);
        }

        key = keys.next();
    }
};

/**
 * Explorer Transaction Service.
 */
export class ExplorerTransactions {
    private readonly network: NetworkManifest;
    private readonly client: ExplorerClient;

    /**
     *
     * @param {NetworkManifest} network
     */
    constructor(network: NetworkManifest) {
        this.network = network;
        this.client = new ExplorerClient();
    }

    /**
     * Fetches and caches results im memory.
     *
     * @param {string} address
     * @param {App.Data.TokenListItemData} asset
     * @returns {Promise<App.Data.TransactionData[]>}
     */
    public async fetchByAddress(
        address: string,
        asset?: App.Data.TokenListItemData,
    ): Promise<App.Data.TransactionData[]> {
        const url = new URL(this.network.links.transactions);

        url.searchParams.set("address", address);

        if (isTruthy(asset)) {
            url.searchParams.set("contractaddress", asset.address);
        }

        if (isTruthy(asset?.is_native_token)) {
            url.searchParams.delete("contractaddress");
            url.searchParams.set("action", "txlist");
        }

        const cacheKey = url.toString();
        const cached = cache.get(cacheKey);

        if (isTruthy(cached)) {
            return cached;
        }

        const result = await this.client.get<{
            status: string;
            message: string;
            result: ExplorerTransactionItem[] | string;
        }>(url);

        const transactions = typeof result === "string" ? [] : this.toJSON(address, result);

        cache.set(cacheKey, transactions);

        return transactions;
    }

    /**
     * Transforms the explorer transactions to supported json format: App.Data.TransactionData.
     *
     * @param {string} address
     * @param {ExplorerTransactionItem[]} transactions
     * @returns {App.Data.TransactionData[]}
     */
    private toJSON(address: string, transactions: ExplorerTransactionItem[]): App.Data.TransactionData[] {
        return transactions.map((transaction) => ({
            hash: transaction.hash,
            isSent: formatAddress(transaction.from) === formatAddress(address),
            isErrored: transaction.isError === "1",
            // TODO(@goga-m)[2023-09-30]: Polygonscan/Etherscan APIs are not returning pending transactions, so this needs to be handled differently.
            isPending: false,
            timestamp: Number(transaction.timeStamp),
            amount: transaction.value,
            fee: (Number(transaction.gasPrice) * Number(transaction.gasUsed)).toString(),
            from: transaction.from,
            to: transaction.to,
            gasPrice: (Number(transaction.gasPrice) / 1e9).toString(),
            gasUsed: transaction.gasUsed,
            nonce: transaction.nonce,
        }));
    }
}
