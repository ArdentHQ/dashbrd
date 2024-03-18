declare namespace App.Data {
    export type Attributes = {
        currency: string;
        date_format: string;
        time_format: "12" | "24";
        timezone: string;
    };
    export type AuthData = {
        user: App.Data.UserData | null;
        wallet: App.Data.Wallet.WalletData | null;
        authenticated: boolean;
        signed: boolean;
    };
    export type CurrencyPriceData = {
        price: number;
        percentChange24h: number;
    };
    export type FloorPriceData = {
        value: string | null;
        change: number | null;
        fiat: number | null;
        currency: string;
        decimals: number;
    };
    export type ImagesData = {
        /** 96x96 */ thumb: string | null;
        /** 256x256 */ small: string | null;
        /** 512x512 */ large: string | null;
    };
    export type NetworkData = {
        name: string;
        isMainnet: boolean;
        chainId: number;
        publicRpcProvider: string;
        explorerUrl: string;
    };
    export type PriceHistoryData = {
        timestamp: number;
        price: number;
    };
    export type SimpleWalletData = {
        address: string;
        domain: string | null;
        avatar: App.Data.Wallet.WalletAvatarData;
    };
    export type TokenListItemData = {
        guid: number | null;
        name: string;
        symbol: string;
        token_price: string | null;
        address: string;
        is_native_token: boolean;
        balance: string;
        decimals: number;
        chain_id: App.Enums.Chain;
        network_id: number;
        minted_supply: string | null;
        total_market_cap: string | null;
        ath: string | null;
        atl: string | null;
        total_volume: string | null;
        fiat_balance: string | null;
        price_change_24h_in_currency: string | null;
        website_url: string | null;
        twitter_url: string | null;
        discord_url: string | null;
        explorer_url: string;
        logo_url: string | null;
        percentage: string;
    };
    export type TokenPortfolioData = {
        name: string;
        symbol: string;
        balance: string | null;
        decimals: string | null;
        fiat_balance: string;
        percentage: string;
    };
    export type TransactionData = {
        hash: string;
        isSent: boolean;
        isErrored: boolean;
        isPending: boolean;
        timestamp: number;
        amount: string;
        fee: string;
        from: string;
        to: string;
        gasPrice: string;
        gasUsed: string;
        nonce: string;
    };
    export type UserData = {
        attributes: Attributes;
    };
    export type VolumeData = {
        value: string | null;
        fiat: number | null;
        currency: string;
        decimals: number;
    };
}
declare namespace App.Data.Articles {
    export type ArticleData = {
        id: number;
        title: string;
        slug: string;
        category: App.Enums.ArticleCategoryEnum;
        audioSrc: string | null;
        content: string;
        image: { small: string; small2x: string; medium: string; medium2x: string; large: string; large2x: string };
        publishedAt: number;
        userId: number;
        authorName: string;
        authorAvatar: { thumb: string | null; thumb2x: string | null };
        collections: Array<App.Data.Articles.FeaturedCollectionData>;
        metaDescription: string | null;
    };
    export type ArticlesData = {
        paginated: {
            data: Array<App.Data.Articles.ArticleData>;
            links: Array<{ url: string | null; label: string; active: boolean }>;
            meta: {
                current_page: number;
                first_page_url: string;
                from: number | null;
                last_page: number;
                last_page_url: string;
                next_page_url: string | null;
                path: string;
                per_page: number;
                prev_page_url: string | null;
                to: number | null;
                total: number;
            };
        };
    };
    export type FeaturedCollectionData = {
        name: string;
        slug: string;
        image: string | null;
    };
}
declare namespace App.Data.Collections {
    export type CollectionBasicDetailsData = {
        slug: string;
        chainId: App.Enums.Chain;
    };
    export type CollectionData = {
        id: number;
        name: string;
        slug: string;
        address: string;
        chainId: App.Enums.Chain;
        floorPrice: App.Data.FloorPriceData;
        supply: number | null;
        image: string | null;
        banner: string | null;
        openSeaSlug: string | null;
        website: string;
        nftsCount: number;
        nfts: Array<App.Data.Collections.SimpleNftData>;
        volume: App.Data.VolumeData;
    };
    export type CollectionDetailData = {
        name: string;
        slug: string;
        description: string | null;
        address: string;
        chainId: App.Enums.Chain;
        floorPrice: string | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        floorPriceFiat: number | null;
        image: string | null;
        banner: string | null;
        bannerUpdatedAt: string | null;
        openSeaSlug: string | null;
        website: string | null;
        twitter: string | null;
        discord: string | null;
        supply: number | null;
        volume: string | null;
        owners: number | null;
        nftsCount: number;
        mintedAt: number | null;
        activityUpdatedAt: string | null;
        activityUpdateRequestedAt: string | null;
        isFetchingActivity: boolean | null;
        token: App.Data.Token.TokenData;
    };
    export type CollectionFeaturedData = {
        id: number;
        name: string;
        slug: string;
        address: string;
        chainId: App.Enums.Chain;
        floorPrice: string | null;
        floorPriceFiat: number | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        image: string | null;
        banner: string | null;
        openSeaSlug: string | null;
        website: string;
        supply: number | null;
        nfts: Array<App.Data.Gallery.GalleryNftData>;
        isFeatured: boolean;
        description: string | null;
        volume: App.Data.VolumeData;
    };
    export type CollectionNftData = {
        id: number;
        collectionId: number;
        name: string | null;
        tokenNumber: string;
        images: App.Data.Nfts.NftImagesData;
        traits: Array<App.Data.Collections.CollectionTraitData>;
    };
    export type CollectionOfTheMonthData = {
        image: string | null;
        votes: number;
        volume: App.Data.VolumeData;
        floorPrice: string | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        name: string | null;
        slug: string;
    };
    export type CollectionStatsData = {
        nfts: number;
        collections: number;
        value: number | null;
    };
    export type CollectionTraitData = {
        displayType: string;
        name: string;
        /** Use the displayType to infer the actual type. */ value: string | number;
        /** Only present for numeric displayTypes. */ valueMin: ?number;
        /** Only present for numeric displayTypes. */ valueMax: ?number;
        nftsPercentage: number;
    };
    export type CollectionTraitFilterData = {
        name: string;
        value: string;
        displayType: string;
        nftsCount: number;
    };
    export type CollectionWinnersData = {
        month: number;
        year: number;
        winners: App.Data.Collections.CollectionOfTheMonthData[];
    };
    export type PopularCollectionData = {
        id: number;
        address: string;
        name: string;
        slug: string;
        supply: number | null;
        chainId: App.Enums.Chain;
        floorPrice: App.Data.FloorPriceData;
        volume: App.Data.VolumeData;
        image: string | null;
    };
    export type SimpleNftData = {
        id: number;
        tokenNumber: string;
        images: App.Data.Nfts.NftImagesData;
    };
    export type VotableCollectionData = {
        id: number;
        rank: number | null;
        name: string;
        address: string;
        image: string | null;
        votes: number | null;
        floorPrice: App.Data.FloorPriceData;
        volume: App.Data.VolumeData;
        nftsCount: number;
        twitterUsername: string | null;
        alreadyWon: boolean;
    };
}
declare namespace App.Data.Gallery {
    export type GalleriesCardData = {
        paginated: {
            data: Array<App.Data.Gallery.GalleryCardData>;
            links: Array<{ url: string | null; label: string; active: boolean }>;
            meta: {
                current_page: number;
                first_page_url: string;
                from: number | null;
                last_page: number;
                last_page_url: string;
                next_page_url: string | null;
                path: string;
                per_page: number;
                prev_page_url: string | null;
                to: number | null;
                total: number;
            };
        };
    };
    export type GalleriesData = {
        paginated: {
            data: Array<App.Data.Gallery.GalleryData>;
            links: Array<{ url: string | null; label: string; active: boolean }>;
            meta: {
                current_page: number;
                first_page_url: string;
                from: number | null;
                last_page: number;
                last_page_url: string;
                next_page_url: string | null;
                path: string;
                per_page: number;
                prev_page_url: string | null;
                to: number | null;
                total: number;
            };
        };
    };
    export type GalleriesStatsData = {
        users: number;
        galleries: number;
        collections: number;
        nfts: number;
    };
    export type GalleryCardData = {
        id: number;
        name: string;
        slug: string;
        likes: number;
        views: number;
        nftsCount: number;
        collectionsCount: number;
        value: number | null;
        coverImage: string | null;
        wallet: App.Data.SimpleWalletData;
        nfts: Array<App.Data.Collections.SimpleNftData>;
        isOwner: boolean;
        hasLiked: boolean;
    };
    export type GalleryCollectionData = {
        name: string;
        slug: string;
        address: string;
        chainId: App.Enums.Chain;
        floorPrice: string | null;
        floorPriceFiat: number | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        image: string | null;
        banner: string | null;
        bannerUpdatedAt: string | null;
        openSeaSlug: string | null;
        website: string | null;
        nftsCount: number | null;
    };
    export type GalleryCollectionsData = {
        paginated: {
            data: Array<App.Data.Gallery.GalleryCollectionData>;
            links: Array<{ url: string | null; label: string; active: boolean }>;
            meta: {
                current_page: number;
                first_page_url: string;
                from: number | null;
                last_page: number;
                last_page_url: string;
                next_page_url: string | null;
                path: string;
                per_page: number;
                prev_page_url: string | null;
                to: number | null;
                total: number;
            };
        };
    };
    export type GalleryData = {
        id: number;
        name: string;
        slug: string;
        likes: number;
        views: number;
        nftsCount: number;
        collectionsCount: number;
        value: number | null;
        coverImage: string | null;
        wallet: App.Data.SimpleWalletData;
        nfts: App.Data.Gallery.GalleryNftsData;
        isOwner: boolean;
        hasLiked: boolean;
    };
    export type GalleryNftData = {
        id: number;
        name: string | null;
        tokenNumber: string;
        tokenAddress: string;
        chainId: number;
        images: App.Data.ImagesData;
        collectionName: string;
        collectionSlug: string;
        collectionNftCount: number;
        collectionWebsite: string;
        collectionImage: string | null;
        floorPrice: string | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        lastActivityFetchedAt: string | null;
        lastViewedAt: string | null;
        ownedByCurrentUser: boolean;
    };
    export type GalleryNftsData = {
        paginated: {
            data: Array<App.Data.Gallery.GalleryNftData>;
            links: Array<{ url: string | null; label: string; active: boolean }>;
            meta: {
                current_page: number;
                first_page_url: string;
                from: number | null;
                last_page: number;
                last_page_url: string;
                next_page_url: string | null;
                path: string;
                per_page: number;
                prev_page_url: string | null;
                to: number | null;
                total: number;
            };
        };
    };
    export type GalleryStatsData = {
        collections: number;
        nfts: number;
        likes: number;
    };
}
declare namespace App.Data.Network {
    export type NetworkWithCollectionsData = {
        id: number;
        name: string;
        isMainnet: boolean;
        chainId: App.Enums.Chain;
        publicRpcProvider: string;
        explorerUrl: string;
        collectionsCount: number;
    };
}
declare namespace App.Data.Nfts {
    export type NftActivitiesData = {
        paginated: {
            data: Array<App.Data.Nfts.NftActivityData>;
            links: Array<{ url: string | null; label: string; active: boolean }>;
            meta: {
                current_page: number;
                first_page_url: string;
                from: number | null;
                last_page: number;
                last_page_url: string;
                next_page_url: string | null;
                path: string;
                per_page: number;
                prev_page_url: string | null;
                to: number | null;
                total: number;
            };
        };
    };
    export type NftActivityData = {
        id: string;
        sender: string;
        recipient: string;
        timestamp: number;
        nft: App.Data.Collections.CollectionNftData;
        type: App.Enums.NftTransferType;
        totalNative: string | null;
        totalUsd: string | null;
    };
    export type NftCollectionData = {
        name: string;
        slug: string;
        description: string | null;
        address: string;
        chainId: App.Enums.Chain;
        floorPrice: string | null;
        website: string;
        image: string | null;
        openSeaSlug: string | null;
    };
    export type NftData = {
        id: number;
        name: string | null;
        description: string | null;
        tokenNumber: string;
        collection: App.Data.Nfts.NftCollectionData;
        images: App.Data.Nfts.NftImagesData;
        wallet: App.Data.SimpleWalletData | null;
        lastViewedAt: string | null;
        lastActivityFetchedAt: string | null;
    };
    export type NftImagesData = {
        /** 96x96 */ thumb: string | null;
        /** 256x256 */ small: string | null;
        /** 512x512 */ large: string | null;
        original: string | null;
        originalRaw: string | null;
    };
}
declare namespace App.Data.Token {
    export type TokenData = {
        address: string;
        isNativeToken: boolean;
        isDefaultToken: boolean;
        chainId: App.Enums.Chain;
        guid: number | null;
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
    };
    export type TokenPriceData = {
        guid: number;
        price: Partial<Record<string, CurrencyPriceData>>;
    };
    export type TokenPriceLookupData = Partial<Record<string, Partial<Record<string, CurrencyPriceData>>>>;
    export type TokenPricesData = {
        paginated: {
            data: Array<App.Data.Token.TokenPriceData>;
            links: Array<{ url: string | null; label: string; active: boolean }>;
            meta: {
                current_page: number;
                first_page_url: string;
                from: number | null;
                last_page: number;
                last_page_url: string;
                next_page_url: string | null;
                path: string;
                per_page: number;
                prev_page_url: string | null;
                to: number | null;
                total: number;
            };
        };
    };
}
declare namespace App.Data.Wallet {
    export type WalletAvatarData = {
        default: string | null;
        small: string | null;
        small2x: string | null;
    };
    export type WalletBalance = {
        address: string;
        balance: string;
        formattedBalance: string;
    };
    export type WalletData = {
        address: string;
        domain: string | null;
        avatar: WalletAvatarData;
        totalUsd: number;
        totalBalanceInCurrency: string;
        totalTokens: number;
        collectionCount: number;
        galleryCount: number;
        timestamps: { tokens_fetched_at: number | null; native_balances_fetched_at: number | null };
        isRefreshingCollections: boolean;
        canRefreshCollections: boolean;
        hasErc1155Nfts: { eth: boolean; polygon: boolean };
    };
}
declare namespace App.Enums {
    export type Chain = 1 | 5 | 137 | 80001;
    export type NftTransferType = "LABEL_MINT" | "LABEL_SALE" | "LABEL_TRANSFER" | "LABEL_BURN";
}
