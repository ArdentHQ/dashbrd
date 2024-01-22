import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import VolumeFactory from "@/Tests/Factories/VolumeFactory";

export default class PopularCollectionFactory extends ModelFactory<App.Data.Collections.PopularCollectionData> {
    protected factory(): App.Data.Collections.PopularCollectionData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            name: faker.lorem.words(),
            slug: faker.lorem.slug(),
            chainId: this.chainId(),
            floorPrice: this.optional(faker.finance.amount(1 * 1e18, 25 * 1e18, 0)),
            floorPriceCurrency: this.optional(this.cryptoCurrency()),
            floorPriceDecimals: this.optional(18),
            floorPriceChange: this.optional(faker.datatype.number({ min: -100, max: 100 })),
            volume: new VolumeFactory().create(),
            image: this.optional(faker.image.avatar(), 0.9),
        };
    }

    withPrices(): this {
        return this.state(() => ({
            floorPrice: faker.finance.amount(1 * 1e18, 25 * 1e18, 0),
            floorPriceCurrency: this.cryptoCurrency(),
            floorPriceDecimals: 18,
        }));
    }

    withoutPrices(): this {
        return this.state(() => ({
            floorPrice: null,
            floorPriceCurrency: null,
            floorPriceDecimals: null,
        }));
    }

    withVolume(): this {
        return this.state(() => ({
            volume: new VolumeFactory().create(),
        }));
    }

    withoutVolume(): this {
        return this.state(() => ({
            volume: new VolumeFactory().empty().create(),
        }));
    }
}
