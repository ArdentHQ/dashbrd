import { faker } from "@faker-js/faker";
import GalleryNftDataFactory from "./GalleryNftDataFactory";
import GalleryWalletDataFactory from "./GalleryWalletDataFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

const url = "http://test.test";

export default class GalleryDataFactory extends ModelFactory<App.Data.Gallery.GalleryData> {
    protected factory(): App.Data.Gallery.GalleryData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            name: faker.lorem.words(),
            slug: faker.lorem.slug(),
            likes: faker.datatype.number({ min: 0, max: 100 }),
            views: faker.datatype.number({ min: 0, max: 100 }),
            nftsCount: faker.datatype.number({ min: 1, max: 16 }),
            collectionsCount: faker.datatype.number({ min: 1, max: 16 }),
            value: this.optional(Number(faker.finance.amount(1 * 1e18, 25 * 1e18, 0))),
            coverImage: this.optional(faker.image.avatar()),
            wallet: new GalleryWalletDataFactory().create(),
            nfts: {
                paginated: {
                    data: new GalleryNftDataFactory().createMany(faker.datatype.number({ min: 0, max: 3 })),
                    links: [
                        {
                            url,
                            label: "test",
                            active: true,
                        },
                    ],
                    meta: {
                        current_page: 1,
                        first_page_url: url,
                        from: 1,
                        last_page: 1,
                        last_page_url: url,
                        next_page_url: null,
                        path: "test",
                        per_page: 10,
                        prev_page_url: null,
                        to: 1,
                        total: 10,
                    },
                },
            },
            isOwner: faker.datatype.boolean(),
            hasLiked: faker.datatype.boolean(),
        };
    }

    withCoverImage(): this {
        return this.state(() => ({
            coverImage: faker.image.avatar(),
        }));
    }

    withoutCoverImage(): this {
        return this.state(() => ({
            coverImage: null,
        }));
    }
}
