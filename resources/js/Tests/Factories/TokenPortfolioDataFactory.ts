import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class TokenPortfolioDataFactory extends ModelFactory<App.Data.TokenPortfolioData> {
    protected factory(): App.Data.TokenPortfolioData {
        return {
            name: faker.lorem.word(),
            symbol: faker.lorem.word(),
            decimals: Number(faker.finance.amount(16, 18, 0)).toString(),
            fiat_balance: faker.finance.amount(1, 1000000, 2),
            balance: faker.finance.amount(1e18, 100e18, 0),
            percentage: (Number(faker.finance.amount(1, 100, 2)) / 100).toString(),
        };
    }

    other(): this {
        return this.state(() => ({
            name: "Other1, Other2, Other3",
            symbol: "Other",
            decimals: null,
            fiat_balance: faker.finance.amount(1, 1000000, 2),
            balance: null,
            percentage: (Number(faker.finance.amount(1, 100, 2)) / 100).toString(),
        }));
    }
}
