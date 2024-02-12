import { faker } from "@faker-js/faker";
import FloorPriceDataFactory from "@/Tests/Factories/FloorPriceDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import VolumeFactory from "@/Tests/Factories/VolumeFactory";

export default class CollectionFactory extends ModelFactory<App.Data.Collections.CollectionData> {
    protected factory(): App.Data.Collections.CollectionData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            name: faker.lorem.words(),
            slug: faker.lorem.slug(),
            address: this.generateAddress(),
            chainId: this.chainId(),
            floorPrice: new FloorPriceDataFactory().create(),
            supply: this.optional(faker.datatype.number({ min: 1, max: 100000 })),
            image: this.optional(faker.image.avatar(), 0.9),
            banner: this.optional(faker.image.avatar()),
            openSeaSlug: this.optional(faker.lorem.slug()),
            website: faker.internet.url(),
            nftsCount: 0,
            nfts: [],
            volume: new VolumeFactory().create(),
        };
    }

    filled(): this {
        return this.state(() => ({
            floorPrice: new FloorPriceDataFactory().create(),
            supply: faker.datatype.number({ min: 1, max: 100000 }),
            image: faker.image.avatar(),
            banner: faker.image.avatar(),
            bannerUpdatedAt: faker.date.recent().toISOString(),
            openSeaSlug: faker.lorem.slug(),
            website: faker.internet.url(),
        }));
    }

    withPrices(): this {
        return this.state(() => ({
            floorPrice: new FloorPriceDataFactory().create(),
        }));
    }

    withoutPrices(): this {
        return this.state(() => ({
            floorPrice: new FloorPriceDataFactory().empty().create(),
        }));
    }
}
