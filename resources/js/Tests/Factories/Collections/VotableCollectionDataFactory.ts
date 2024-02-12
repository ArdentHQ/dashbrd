import { faker } from "@faker-js/faker";
import FloorPriceDataFactory from "@/Tests/Factories/FloorPriceDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import VolumeFactory from "@/Tests/Factories/VolumeFactory";

export default class VotableCollectionDataFactory extends ModelFactory<App.Data.Collections.VotableCollectionData> {
    protected factory(): App.Data.Collections.VotableCollectionData {
        return {
            id: faker.datatype.number({ min: 1, max: 1000 }),
            rank: faker.datatype.number({ min: 1, max: 1000 }),
            name: faker.lorem.words(),
            address: this.generateAddress(),
            image: this.optional(faker.image.avatar(), 0.9),
            votes: this.optional(faker.datatype.number({ min: 1, max: 1000 })),
            floorPrice: new FloorPriceDataFactory().create(),
            volume: new VolumeFactory().create(),
            nftsCount: faker.datatype.number({ min: 1, max: 100 }),
            twitterUsername: null,
            alreadyWon: false,
        };
    }
}
