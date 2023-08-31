import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class TokenListItemDataFactory extends ModelFactory<App.Data.TokenListItemData> {
    protected factory(): App.Data.TokenListItemData {
        return {
            guid: this.optional(faker.datatype.number()),
            name: faker.lorem.word(),
            symbol: faker.lorem.word(),
            decimals: Number(faker.finance.amount(16, 18, 0)),
            token_price: faker.finance.amount(1, 10000, 2),
            address: this.generateAddress(),
            is_native_token: faker.datatype.boolean(),
            balance: faker.finance.amount(1 * 1e18, 25 * 1e18, 0),
            chain_id: this.chainId(),
            network_id: faker.helpers.arrayElement([1, 2, 3, 4]),
            minted_supply: this.optional(faker.finance.amount(1, 1000000, 0)),
            total_market_cap: this.optional(faker.finance.amount(1, 1000000, 0)),
            ath: this.optional(faker.finance.amount(1, 1000000, 0)),
            atl: this.optional(faker.finance.amount(1, 1000000, 0)),
            total_volume: this.optional(faker.finance.amount(1, 1000000, 0)),
            fiat_balance: this.optional(faker.finance.amount(1, 1000000, 0)),
            price_change_24h_in_currency: this.optional(faker.finance.amount(-99, 99, 0)),
            website_url: this.optional(faker.internet.url()),
            twitter_url: this.optional(faker.internet.url()),
            discord_url: this.optional(faker.internet.url()),
            explorer_url: faker.internet.url(),
            logo_url: this.optional(faker.internet.url()),
            percentage: (Number(faker.finance.amount(0, 100, 2)) / 100).toString(),
        };
    }
}
