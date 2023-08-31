import { faker } from "@faker-js/faker";
import CollectionTraitDataFactory from "@/Tests/Factories/CollectionTraitDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";

export default class CollectionNftDataFactory extends ModelFactory<App.Data.Collections.CollectionNftData> {
    protected factory(): App.Data.Collections.CollectionNftData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            collectionId: faker.datatype.number({ min: 1, max: 100000 }),
            name: this.optional(faker.lorem.words()),
            tokenNumber: faker.datatype.number({ min: 1, max: 100000 }).toString(),
            images: new NftImagesDataFactory().create(),
            traits: new CollectionTraitDataFactory().createMany(faker.datatype.number({ min: 0, max: 3 })),
        };
    }

    withImages(): this {
        return this.state(() => ({
            images: new NftImagesDataFactory().withValues().create(),
        }));
    }

    withoutImages(): this {
        return this.state(() => ({
            images: new NftImagesDataFactory().withoutValues().create(),
        }));
    }
}
