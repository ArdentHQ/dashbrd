import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class NftWalletFactory extends ModelFactory<App.Data.Nfts.NftWalletData> {
    protected factory(): App.Data.Nfts.NftWalletData {
        return {
            address: this.generateAddress(),
        };
    }
}
