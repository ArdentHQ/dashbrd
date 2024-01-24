import { faker } from "@faker-js/faker";
import VolumeFactory from "@/Tests/Factories/VolumeFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class CollectionOfTheMonthFactory extends ModelFactory<App.Data.Collections.CollectionOfTheMonthData> {
    protected factory(): App.Data.Collections.CollectionOfTheMonthData {
        return {
            image: this.optional(faker.image.avatar(), 0.9),
            votes: faker.datatype.number({ min: 1, max: 100000 }),
            volume: new VolumeFactory().create(),
            floorPrice: "1",
            floorPriceCurrency: "ETH",
            floorPriceDecimals: 18,
            name: faker.word.noun(),
            slug: faker.word.noun(),
        };
    }
}
