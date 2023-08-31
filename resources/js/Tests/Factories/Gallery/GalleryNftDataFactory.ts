import { faker } from "@faker-js/faker";
import ImagesDataFactory from "@/Tests/Factories/ImagesDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class GalleryNftDataFactory extends ModelFactory<App.Data.Gallery.GalleryNftData> {
    protected factory(): App.Data.Gallery.GalleryNftData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            name: this.optional(faker.lorem.words()),
            tokenNumber: faker.datatype.number({ min: 1, max: 100000 }).toString(),
            tokenAddress: this.generateAddress(),
            chainId: this.chainId(),
            images: new ImagesDataFactory().create(),
            collectionName: faker.lorem.words(),
            collectionSlug: faker.lorem.slug(),
            collectionNftCount: Number(faker.datatype.number({ min: 0, max: 100 })),
            collectionWebsite: faker.internet.url(),
            collectionImage: this.optional(faker.image.avatar()),
            floorPrice: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            floorPriceCurrency: this.optional(this.cryptoCurrency()),
            floorPriceDecimals: this.optional(18),
            lastActivityFetchedAt: new Date().toString(),
            lastViewedAt: new Date().toString(),
        };
    }

    withImages(): this {
        return this.state(() => ({
            images: new ImagesDataFactory().withValues().create(),
        }));
    }

    withCollectionImage(): this {
        return this.state(() => ({
            collectionImage: faker.image.avatar(),
        }));
    }

    withoutCollectionImage(): this {
        return this.state(() => ({
            collectionImage: null,
        }));
    }
}
