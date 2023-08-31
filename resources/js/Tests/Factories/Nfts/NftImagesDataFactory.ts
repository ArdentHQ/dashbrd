import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class NftImagesDataFactory extends ModelFactory<App.Data.Nfts.NftImagesData> {
    protected factory(): App.Data.Nfts.NftImagesData {
        return {
            thumb: this.optional(faker.image.avatar()),
            small: this.optional(faker.image.avatar()),
            large: this.optional(faker.image.avatar()),
            original: this.optional(faker.image.avatar()),
            originalRaw: this.optional(faker.image.avatar()),
        };
    }

    withValues(): this {
        return this.state(() => ({
            thumb: faker.image.avatar(),
            small: faker.image.avatar(),
            large: faker.image.avatar(),
            original: faker.image.avatar(),
            originalRaw: faker.image.avatar(),
        }));
    }

    withoutValues(): this {
        return this.state(() => ({
            thumb: null,
            small: null,
            large: null,
            original: null,
            originalRaw: null,
        }));
    }
}
