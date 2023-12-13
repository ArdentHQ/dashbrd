import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class VotableCollectionDataFactory extends ModelFactory<App.Data.Collections.VotableCollectionData> {
    protected factory(): App.Data.Collections.VotableCollectionData {
        return {
            id: faker.datatype.number({ min: 1, max: 1000 }),
            rank: faker.datatype.number({ min: 1, max: 1000 }),
            name: faker.lorem.words(),
            address: this.generateAddress(),
            image: this.optional(faker.image.avatar(), 0.9),
            votes: this.optional(faker.datatype.number({ min: 1, max: 1000 })),
            floorPrice: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            floorPriceFiat: this.optional(Number(faker.finance.amount(1, 1500, 2))),
            floorPriceCurrency: this.optional(this.cryptoCurrency()),
            floorPriceDecimals: this.optional(18),
            volume: this.optional(faker.datatype.number({ min: 1, max: 100000 }).toString()),
            volumeFiat: this.optional(Number(faker.finance.amount(1, 1500, 2))),
            volumeCurrency: "ETH",
            volumeDecimals: 18,
            nftsCount: faker.datatype.number({ min: 1, max: 100 }),
            twitterUsername: null,
        };
    }
}
