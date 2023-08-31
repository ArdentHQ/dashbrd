import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class NFTCollectionFactory extends ModelFactory<App.Data.Nfts.NftCollectionData> {
    protected factory(): App.Data.Nfts.NftCollectionData {
        return {
            name: faker.lorem.words(),
            slug: faker.lorem.slug(),
            description: this.optional(faker.lorem.paragraph()),
            address: this.generateAddress(),
            chainId: faker.helpers.arrayElement([1, 5, 137, 80001]),
            floorPrice: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            website: faker.internet.url(),
            image: this.optional(faker.image.avatar(), 0.9),
        };
    }

    withoutImage(): this {
        return this.state(() => ({
            image: null,
        }));
    }

    withImage(): this {
        return this.state(() => ({
            image: faker.image.avatar(),
        }));
    }
}
