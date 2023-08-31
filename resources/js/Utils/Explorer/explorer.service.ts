import { ExplorerClient } from "./explorer.client";
import { type NetworkManifest, networks } from "./explorer.networks";
import { ExplorerTransactions } from "./explorer.transactions.service";
import { type FeesData } from "@/Utils/api.contracts";
import { isTruthy } from "@/Utils/is-truthy";

/**
 * Common Explorer class for etherscan & polygonscan APIs.
 */
export class Explorer {
    private readonly network: NetworkManifest;
    private readonly client: ExplorerClient;
    private readonly transactions: ExplorerTransactions;

    constructor(private readonly chainId: number) {
        const network = networks.find((network) => network.chainId === chainId);

        if (!isTruthy(network)) {
            throw new Error(`Chain ${chainId} is not supported.`);
        }

        this.network = network;
        this.client = new ExplorerClient();
        this.transactions = new ExplorerTransactions(this.network);
    }

    /**
     * Fetches the latest transactions (default limit 11).
     *
     * @param {string} address
     * @param {App.Data.TokenListItemData} asset
     * @returns {Promise<App.Data.TransactionData[]>}
     */
    public async transactionsByAddress(
        address: string,
        asset?: App.Data.TokenListItemData,
    ): Promise<App.Data.TransactionData[]> {
        return await this.transactions.fetchByAddress(address, asset);
    }

    /**
     * Fetch network fees.
     *
     * @returns {Promise<FeesData>}
     */
    public async fees(): Promise<FeesData> {
        const url = new URL(this.network.links.fees);

        return await this.client.get<{
            status: string;
            message: string;
            result: FeesData;
        }>(url);
    }
}
