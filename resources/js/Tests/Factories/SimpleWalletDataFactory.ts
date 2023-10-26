import { faker } from "@faker-js/faker";
import WalletAvatarDataFactory from "./Wallet/WalletAvatarDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class SimpleWalletDataFactory extends ModelFactory<App.Data.SimpleWalletData> {
    protected factory(): App.Data.SimpleWalletData {
        return {
            address: this.generateAddress(),
            domain: this.optional(faker.internet.domainName()),
            avatar: new WalletAvatarDataFactory().create(),
        };
    }
}
