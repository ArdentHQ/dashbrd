import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class VotableCollectionDataFactory extends ModelFactory<App.Data.Collections.VotableCollectionData> {
    protected factory(): App.Data.Collections.VotableCollectionData {
        return {
            id: faker.datatype.number({ min: 1, max: 1000 }),
            index: faker.datatype.number({ min: 1, max: 1000 }),
            name: faker.lorem.words(),
            image: this.optional(faker.image.avatar(), 0.9),
            votes: this.optional(faker.datatype.number({ min: 1, max: 1000 })),
            volume: this.optional(faker.datatype.number({ min: 1, max: 100000 }).toString()),
        };
    }
}
