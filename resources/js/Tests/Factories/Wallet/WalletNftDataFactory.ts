import { faker } from "@faker-js/faker";
import ImagesDataFactory from "@/Tests/Factories/ImagesDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class WalletNftDataFactory extends ModelFactory<App.Data.Wallet.WalletNftData> {
    protected factory(): App.Data.Wallet.WalletNftData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            images: new ImagesDataFactory().create(),
        };
    }
}
