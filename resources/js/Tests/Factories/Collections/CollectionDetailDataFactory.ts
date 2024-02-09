import { faker } from "@faker-js/faker";
import CollectionNftDataFactory from "./CollectionNftDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";

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
            bannerUpdatedAt: this.optional(faker.date.recent().toISOString()),
            openSeaSlug: this.optional(faker.lorem.slug()),
            website: this.optional(faker.internet.url()),
            twitter: this.optional(faker.internet.url()),
            discord: this.optional(faker.internet.url()),
            supply: this.optional(faker.datatype.number({ min: 1000, max: 10000 })),
            volume: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            owners: this.optional(faker.datatype.number(1000)),
            nftsCount: 0,
            token: new TokenDataFactory().create(),
            mintedAt: this.optional(faker.date.past().getTime()),
            activityUpdatedAt: this.optional(faker.date.recent().toISOString()),
            activityUpdateRequestedAt: this.optional(faker.date.recent().toISOString()),
            isFetchingActivity: false,
        };
    }

    withCryptoCurrency(currency: null | string, decimals?: number): this {
        return this.state(() => ({
            floorPriceCurrency: currency,
            token: new TokenDataFactory().create({
                symbol: currency ?? undefined,
                decimals,
            }),
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
