import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class WalletAvatarDataFactory extends ModelFactory<App.Data.Wallet.WalletAvatarData> {
    protected factory(): App.Data.Wallet.WalletAvatarData {
        return {
            default: this.optional(faker.image.avatar()),
            small: this.optional(faker.image.avatar()),
            small2x: this.optional(faker.image.avatar()),
        };
    }

    withValues(): this {
        return this.state(() => ({
            default: faker.image.avatar(),
            small: faker.image.avatar(),
            small2x: faker.image.avatar(),
        }));
    }

    withoutValues(): this {
        return this.state(() => ({
            default: null,
            small: null,
            small2x: null,
        }));
    }
}
