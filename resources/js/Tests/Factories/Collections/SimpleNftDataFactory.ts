import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";

export default class SimpleNftDataFactory extends ModelFactory<App.Data.Collections.SimpleNftData> {
    protected factory(): App.Data.Collections.SimpleNftData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            tokenNumber: faker.datatype.number({ min: 1, max: 100000 }).toString(),
            images: new NftImagesDataFactory().withValues().create(),
        };
    }
}
