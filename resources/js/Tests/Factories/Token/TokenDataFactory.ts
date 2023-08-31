import { faker } from "@faker-js/faker";
import ImagesDataFactory from "@/Tests/Factories/ImagesDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export interface TokenData {
    address: string;
    isNativeToken: boolean;
    isDefaultToken: boolean;
    name: string;
    symbol: string;
    decimals: number;
    images: App.Data.ImagesData;
    marketCap: number | null;
    volume: number | null;
    socials: { website: string | null; discord: string | null; twitter: string | null };
    marketData: {
        market_cap: string | null;
        total_volume: string | null;
        minted_supply: string | null;
        ath: string | null;
        atl: string | null;
    };
}

export default class TokenDataFactory extends ModelFactory<App.Data.Token.TokenData> {
    protected factory(): App.Data.Token.TokenData {
        return {
            guid: this.optional(Number(faker.finance.amount(1, 1000, 0))),
            chainId: this.chainId(),
            address: this.generateAddress(),
            isNativeToken: faker.datatype.boolean(),
            isDefaultToken: faker.datatype.boolean(),
            name: faker.lorem.word(),
            symbol: faker.lorem.word(),
            decimals: Number(faker.finance.amount(16, 18, 0)),
            images: new ImagesDataFactory().create(),
            marketCap: this.optional(Number(faker.finance.amount(1, 1000000, 0))),
            volume: this.optional(Number(faker.finance.amount(1, 1000000, 0))),
            socials: {
                website: this.optional(faker.internet.url()),
                discord: this.optional(faker.internet.url()),
                twitter: this.optional(faker.internet.domainWord()),
            },
            marketData: {
                market_cap: this.optional(faker.finance.amount(1, 1000000, 0)),
                total_volume: this.optional(faker.finance.amount(1, 1000000, 0)),
                minted_supply: this.optional(faker.finance.amount(1, 1000000, 0)),
                ath: this.optional(faker.finance.amount(1, 1000000, 0)),
                atl: this.optional(faker.finance.amount(1, 1000000, 0)),
            },
        };
    }

    native(): this {
        return this.state(() => ({
            isNativeToken: true,
        }));
    }
}
