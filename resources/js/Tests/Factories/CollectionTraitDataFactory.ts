import { faker } from "@faker-js/faker";
import ModelFactory from "./ModelFactory";

export default class CollectionTraitDataFactory extends ModelFactory<App.Data.Collections.CollectionTraitData> {
    protected factory(): App.Data.Collections.CollectionTraitData {
        return {
            displayType: faker.random.word(),
            name: faker.lorem.word(),
            value: faker.lorem.word(),
            nftsPercentage: faker.datatype.float({ min: 0, max: 100 }),
            valueMax: faker.datatype.number(),
            valueMin: faker.datatype.number(),
            nftsCount: faker.datatype.number(),
        };
    }
}
