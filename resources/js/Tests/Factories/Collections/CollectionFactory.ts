import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class CollectionFactory extends ModelFactory<App.Data.Collections.CollectionData> {
    protected factory(): App.Data.Collections.CollectionData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            name: faker.lorem.words(),
            slug: faker.lorem.slug(),
            address: this.generateAddress(),
            chainId: this.chainId(),
            floorPrice: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            floorPriceFiat: this.optional(Number(faker.finance.amount(1, 1500, 2))),
            floorPriceCurrency: this.optional(this.cryptoCurrency()),
            floorPriceDecimals: this.optional(18),
            image: this.optional(faker.image.avatar(), 0.9),
            banner: this.optional(faker.image.avatar()),
            website: faker.internet.url(),
            nftsCount: 0,
        };
    }

    filled(): this {
        return this.state(() => ({
            floorPrice: faker.finance.amount(1 * 1e18, 25 * 1e18, 0),
            floorPriceFiat: Number(faker.finance.amount(1, 1500, 2)),
            floorPriceCurrency: this.cryptoCurrency(),
            floorPriceDecimals: 18,
            image: faker.image.avatar(),
            banner: faker.image.avatar(),
            bannerUpdatedAt: faker.date.recent().toISOString(),
            openSeaSlug: faker.lorem.slug(),
            openSeaSlugUpdatedAt: faker.date.recent().toISOString(),
            website: faker.internet.url(),
        }));
    }

    withPrices(): this {
        return this.state(() => ({
            floorPrice: faker.finance.amount(1 * 1e18, 25 * 1e18, 0),
            floorPriceFiat: Number(faker.finance.amount(1, 1500, 2)),
            floorPriceCurrency: this.cryptoCurrency(),
            floorPriceDecimals: 18,
        }));
    }

    withoutPrices(): this {
        return this.state(() => ({
            floorPrice: null,
            floorPriceFiat: null,
            floorPriceCurrency: null,
            floorPriceDecimals: null,
        }));
    }
}
