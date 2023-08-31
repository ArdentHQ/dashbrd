import { faker } from "@faker-js/faker";
import ModelFactory from "./ModelFactory";

export default class NetworkDataFactory extends ModelFactory<App.Data.NetworkData> {
    protected factory(): App.Data.NetworkData {
        return {
            name: faker.lorem.words(),
            chainId: this.chainId(),
            isMainnet: faker.datatype.boolean(),
            publicRpcProvider: faker.internet.url(),
            explorerUrl: faker.internet.url(),
        };
    }
}
