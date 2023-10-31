import { faker } from "@faker-js/faker";
import { ethers } from "ethers";
import { ExplorerChains } from "@/Utils/Explorer";
export default abstract class ModelFactory<T extends Record<string, unknown>> {
    protected states: Array<(data: T) => Partial<T>> = [];

    protected abstract factory(overrides: Partial<T>): T;

    protected state(callback: (data: T) => Partial<T>): this {
        this.states.push(callback);

        return this;
    }

    protected optional = <K>(value: K, probability = 0.5): K | null =>
        faker.helpers.maybe(() => value, {
            probability,
        }) ?? null;

    protected chainId = (): App.Enums.Chain =>
        faker.helpers.arrayElement([ExplorerChains.PolygonMainnet, ExplorerChains.EthereumMainnet]);

    protected hexadecimalAddress = (): string => faker.datatype.hexadecimal({ length: 40 });

    protected generateAddress = (): string => ethers.Wallet.createRandom().address;

    protected cryptoCurrency = (): string => faker.helpers.arrayElement(["ETH", "MATIC", "USDC"]);

    createMany(count: number, overrides: Partial<T> = {}): T[] {
        return Array.from({ length: count }, () => this.create(overrides));
    }

    create(overrides: Partial<T> = {}): T {
        const data = this.factory(overrides);

        return {
            // eslint-disable-next-line unicorn/no-array-reduce
            ...this.states.reduce((data, callback) => ({ ...data, ...callback(data) }), data),
            ...overrides,
        };
    }
}
