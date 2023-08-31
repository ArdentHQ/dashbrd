import { faker } from "@faker-js/faker";
import ModelFactory from "./ModelFactory";

export default class UserDataFactory extends ModelFactory<App.Data.UserData> {
    protected factory(): App.Data.UserData {
        return {
            attributes: {
                currency: faker.finance.currencyCode(),
                date_format: faker.helpers.arrayElement(["d/m/Y", "m/d/Y", "Y/m/d"]),
                time_format: faker.helpers.arrayElement(["12", "24"]),
                timezone: faker.helpers.arrayElement(["UTC", "America/Mexico_City", "Europe/Madrid"]),
            },
        };
    }

    withUSDCurrency(): this {
        return this.state((original) => ({
            attributes: {
                ...original.attributes,
                currency: "USD",
            },
        }));
    }
}
