import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import WalletAvatarDataFactory from "@/Tests/Factories/Wallet/WalletAvatarDataFactory";

export default class GalleryWalletDataFactory extends ModelFactory<App.Data.Gallery.GalleryWalletData> {
    protected factory(): App.Data.Gallery.GalleryWalletData {
        return {
            address: this.generateAddress(),
            domain: this.optional(faker.internet.domainName()),
            avatar: new WalletAvatarDataFactory().create(),
        };
    }
}
