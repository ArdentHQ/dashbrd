import { faker } from "@faker-js/faker";
import ModelFactory from "@/Tests/Factories/ModelFactory";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";

export default class ArticleDataFactory extends ModelFactory<App.Data.Articles.ArticleData> {
    protected factory(): App.Data.Articles.ArticleData {
        return {
            id: faker.datatype.number({ min: 1, max: 100000 }),
            slug: faker.lorem.slug(),
            title: faker.lorem.words(),
            image: {
                small: faker.image.imageUrl(),
                small2x: faker.image.imageUrl(),
                medium: faker.image.imageUrl(),
                medium2x: faker.image.imageUrl(),
                large: faker.image.imageUrl(),
                large2x: faker.image.imageUrl(),
            },
            audioSrc: null,
            userId: faker.datatype.number({ min: 1, max: 100000 }),
            content: faker.lorem.paragraph(),
            category: "news",
            publishedAt: Number(faker.finance.amount(1, 1500, 2)),
            metaDescription: faker.lorem.paragraph(),
            collections: new NFTCollectionFactory()
                .withImage()
                .createMany(3) as App.Data.Articles.FeaturedCollectionData[],
            authorName: faker.name.firstName(),
            authorAvatar: {
                thumb: faker.image.avatar(),
                thumb2x: faker.image.avatar(),
            },
        };
    }
}
