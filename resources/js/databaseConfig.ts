export const databaseConfig = {
    name: "dashbrd",
    version: 1,
    objectStoresMeta: [
        {
            store: "gallery-drafts",
            storeConfig: { keyPath: "id", autoIncrement: true },
            storeSchema: [
                { name: "walletAddress", keypath: "walletAddress", options: { unique: false } },
                { name: "title", keypath: "title", options: { unique: false } },
                { name: "cover", keypath: "cover", options: { unique: false } },
                { name: "coverType", keypath: "coverType", options: { unique: false } },
                { name: "coverFileName", keypath: "coverFileName", options: { unique: false } },
                { name: "nfts", keypath: "nfts", options: { unique: false } },
                { name: "value", keypath: "value", options: { unique: false } },
                { name: "collectionsCount", keypath: "collectionsCount", options: { unique: false } },
                { name: "updatedAt", keypath: "updatedAt", options: { unique: false } },
            ],
        },
    ],
};
