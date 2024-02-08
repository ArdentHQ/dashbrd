import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class VolumeFactory extends ModelFactory<App.Data.VolumeData> {
    protected factory(): App.Data.VolumeData {
        return {
            value: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            fiat: this.optional(Number(faker.finance.amount(1, 1500, 2))),
            currency: this.cryptoCurrency(),
            decimals: 18,
        };
    }

    empty(): this {
        return this.state(() => ({
            value: null,
            fiat: null,
        }));
    }
}
