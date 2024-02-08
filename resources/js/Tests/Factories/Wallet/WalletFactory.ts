import { faker } from "@faker-js/faker";
import WalletAvatarDataFactory from "./WalletAvatarDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class WalletFactory extends ModelFactory<App.Data.Wallet.WalletData> {
    protected factory(): App.Data.Wallet.WalletData {
        return {
            totalBalanceInCurrency: faker.finance.amount(1, 100000, 2),
            totalTokens: faker.datatype.number({ min: 0, max: 10 }),
            address: this.generateAddress(),
            domain: this.optional(faker.internet.domainWord() + ".eth"),
            avatar: new WalletAvatarDataFactory().create(),
            totalUsd: Number(faker.finance.amount(1, 100000, 2)),
            collectionCount: Number(faker.datatype.number({ min: 0, max: 100 })),
            galleryCount: Number(faker.datatype.number({ min: 0, max: 100 })),
            timestamps: {
                tokens_fetched_at: this.optional(faker.date.past().getTime()),
                native_balances_fetched_at: this.optional(faker.date.past().getTime()),
            },
            isRefreshingCollections: false,
            canRefreshCollections: false,
            hasErc1155Nfts: {
                eth: false,
                polygon: false,
            },
        };
    }

    withDomain(): this {
        return this.state(() => ({
            domain: faker.internet.domainWord() + ".eth",
        }));
    }

    withoutDomain(): this {
        return this.state(() => ({
            domain: null,
        }));
    }

    withAvatar(): this {
        return this.state(() => ({
            avatar: new WalletAvatarDataFactory().withValues().create(),
        }));
    }

    withoutAvatar(): this {
        return this.state(() => ({
            avatar: new WalletAvatarDataFactory().withoutValues().create(),
        }));
    }
}
