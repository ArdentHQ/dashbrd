import { faker } from "@faker-js/faker";
import CollectionNftDataFactory from "@/Tests/Factories/Collections/CollectionNftDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class NFTActivityFactory extends ModelFactory<App.Data.Nfts.NftActivityData> {
    protected factory(): App.Data.Nfts.NftActivityData {
        return {
            id: this.hexadecimalAddress(),
            sender: this.generateAddress(),
            recipient: this.generateAddress(),
            timestamp: faker.date.past().getTime(),
            nft: new CollectionNftDataFactory().create(),
            type: faker.helpers.arrayElement(["LABEL_MINT", "LABEL_SALE", "LABEL_TRANSFER"]),
            totalUsd: faker.datatype.number().toString(),
            totalNative: faker.datatype.number().toString(),
        };
    }
}
