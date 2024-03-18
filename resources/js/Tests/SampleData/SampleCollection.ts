import VolumeFactory from "@/Tests/Factories/VolumeFactory";

export const SampleCollection: App.Data.Collections.CollectionData = {
    id: 1,
    name: "Moonbirds",
    slug: "moonbirds",
    banner: "https://i.seadn.io/gae/U1IY0rRHvXZ9K7fqDgBBJVnkJhlv0YrL0aMfYzY4XzTkWGyWroq8-GymDy_1e3S17Ze_FPIwg9yjheKxp42SSzUBrp_744yrA16XHKo?w=500&amp;auto=format",
    address: "0x23581767a106ae21c074b2276D25e5C3e136a68b",
    chainId: 1,
    floorPrice: {
        value: "1000000000000000000",
        fiat: null,
        currency: "",
        decimals: 18,
        change: null,
    },
    supply: 10000,
    image: "https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500&auto=format",
    website: "https://www.proof.xyz/moonbirds",
    nftsCount: 1,
    openSeaSlug: "proof-moonbirds",
    nfts: [],
    volume: new VolumeFactory().create(),
};
