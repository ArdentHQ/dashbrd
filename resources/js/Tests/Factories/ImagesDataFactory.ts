import { faker } from "@faker-js/faker";
import ModelFactory from "./ModelFactory";

export default class ImagesDataFactory extends ModelFactory<App.Data.ImagesData> {
    protected factory(): App.Data.ImagesData {
        return {
            thumb: this.optional(faker.image.avatar()),
            small: this.optional(faker.image.avatar()),
            large: this.optional(faker.image.avatar()),
        };
    }

    withValues(): this {
        return this.state(() => ({
            thumb: faker.image.avatar(),
            small: faker.image.avatar(),
            large: faker.image.avatar(),
        }));
    }

    withoutValues(): this {
        return this.state(() => ({
            thumb: null,
            small: null,
            large: null,
        }));
    }
}
