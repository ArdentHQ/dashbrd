import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import NftWalletFactory from "@/Tests/Factories/Nfts/NftWalletFactory";

export default class NftFactory extends ModelFactory<App.Data.Nfts.NftData> {
    protected factory(): App.Data.Nfts.NftData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            name: this.optional(faker.lorem.words()),
            description: this.optional(faker.lorem.words()),
            tokenNumber: faker.datatype.number({ min: 1, max: 100000 }).toString(),
            collection: new NFTCollectionFactory().withImage().create(),
            images: new NftImagesDataFactory().create(),
            wallet: this.optional(new NftWalletFactory().create()),
            lastViewedAt: null,
            lastActivityFetchedAt: null,
        };
    }

    public withWallet(): this {
        return this.state(() => ({
            wallet: new NftWalletFactory().create(),
        }));
    }

    public withoutWallet(): this {
        return this.state(() => ({
            wallet: null,
        }));
    }
}
