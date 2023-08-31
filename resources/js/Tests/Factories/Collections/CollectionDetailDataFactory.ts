import { faker } from "@faker-js/faker";
import CollectionNftDataFactory from "./CollectionNftDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class CollectionDetailDataFactory extends ModelFactory<App.Data.Collections.CollectionDetailData> {
    protected factory(): App.Data.Collections.CollectionDetailData {
        return {
            name: faker.lorem.words(),
            slug: faker.lorem.slug(),
            description: this.optional(faker.lorem.paragraph()),
            address: this.generateAddress(),
            chainId: this.chainId(),
            floorPrice: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            floorPriceCurrency: this.optional(this.cryptoCurrency()),
            floorPriceDecimals: this.optional(18),
            floorPriceFiat: this.optional(Number(faker.finance.amount(1, 1500, 2))),
            image: this.optional(faker.image.avatar(), 0.9),
            banner: this.optional(faker.image.avatar()),
            website: this.optional(faker.internet.url()),
            twitter: this.optional(faker.internet.url()),
            discord: this.optional(faker.internet.url()),
            supply: this.optional(faker.datatype.number({ min: 1000, max: 10000 })),
            volume: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            owners: this.optional(faker.datatype.number(1000)),
            nftsCount: 0,
            mintedAt: this.optional(faker.date.past().getTime()),
            nfts: {
                paginated: new CollectionNftDataFactory().createMany(faker.datatype.number({ min: 0, max: 3 })),
            },
        };
    }

    withCryptoCurrency(currency: null | string): this {
        return this.state(() => ({
            floorPriceCurrency: currency,
        }));
    }

    withoutPrices(): this {
        return this.state(() => ({
            floorPrice: null,
            floorPriceCurrency: null,
            floorPriceDecimals: null,
        }));
    }

    withNfts(count = 3): this {
        return this.state(() => ({
            nftsCount: count,
            nfts: {
                paginated: new CollectionNftDataFactory().withImages().createMany(count),
            },
        }));
    }
}
