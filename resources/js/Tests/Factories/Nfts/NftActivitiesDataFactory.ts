/* eslint-disable sonarjs/no-duplicate-string */

import { faker } from "@faker-js/faker";
import NFTActivityFactory from "./NFTActivityFactory";
import ModelFactory from "@/Tests/Factories/ModelFactory";

export default class NftActivitiesDataFactory extends ModelFactory<App.Data.Nfts.NftActivitiesData> {
    protected factory(): App.Data.Nfts.NftActivitiesData {
        return {
            paginated: {
                data: new NFTActivityFactory().createMany(faker.datatype.number({ min: 1, max: 3 })),
                links: [
                    {
                        url: "http://test.test",
                        label: "test",
                        active: true,
                    },
                ],
                meta: {
                    current_page: 1,
                    first_page_url: "http://test.test",
                    from: 1,
                    last_page: 1,
                    last_page_url: "http://test.test",
                    next_page_url: null,
                    path: "test",
                    per_page: 10,
                    prev_page_url: null,
                    to: 1,
                    total: 10,
                },
            },
        };
    }
}
