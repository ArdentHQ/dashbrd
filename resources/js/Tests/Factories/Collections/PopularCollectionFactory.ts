import { faker } from "@faker-js/faker";
import FloorPriceDataFactory from "@/Tests/Factories/FloorPriceDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import VolumeFactory from "@/Tests/Factories/VolumeFactory";

export default class PopularCollectionFactory extends ModelFactory<App.Data.Collections.PopularCollectionData> {
    protected factory(): App.Data.Collections.PopularCollectionData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            address: this.generateAddress(),
            name: faker.lorem.words(),
            slug: faker.lorem.slug(),
            supply: faker.datatype.number({ min: 1, max: 100000 }),
            chainId: this.chainId(),
            floorPrice: new FloorPriceDataFactory().create(),
            volume: new VolumeFactory().create(),
            image: this.optional(faker.image.avatar(), 0.9),
        };
    }

    withPrices(): this {
        return this.state(() => ({
            floorPrice: new FloorPriceDataFactory().create(),
        }));
    }

    withoutPrices(): this {
        return this.state(() => ({
            floorPrice: new FloorPriceDataFactory().empty().create(),
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
