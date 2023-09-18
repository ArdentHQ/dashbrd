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
    };
    export type CurrencyPriceData = {
        price: number;
        percentChange24h: number;
    };
    export type ImagesData = {
        /** 96x96 */ thumb: string | null;
        /** 256x256 */ small: string | null;
        /** 512x512 */ large: string | null;
    };
    export type NetworkData = {
        name: string;
        chainId: number;
        isMainnet: boolean;
        publicRpcProvider: string;
        explorerUrl: string;
    };
    export type PriceHistoryData = {
        timestamp: number;
        price: number;
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
        chain_id: App.Enums.Chains;
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
}
declare namespace App.Data.Collections {
    export type CollectionBasicDetailsData = {
        slug: string;
        chainId: App.Enums.Chains;
    };
    export type CollectionData = {
        id: number;
        name: string;
        slug: string;
        address: string;
        chainId: App.Enums.Chains;
        floorPrice: string | null;
        floorPriceFiat: number | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        image: string | null;
        banner: string | null;
        website: string;
        nftsCount: number;
    };
    export type CollectionDetailData = {
        name: string;
        slug: string;
        description: string | null;
        address: string;
        chainId: App.Enums.Chains;
        floorPrice: string | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        floorPriceFiat: number | null;
        image: string | null;
        banner: string | null;
        bannerUpdatedAt: string | null;
        website: string | null;
        twitter: string | null;
        discord: string | null;
        supply: number | null;
        volume: string | null;
        owners: number | null;
        nftsCount: number;
        mintedAt: number | null;
        nfts: App.Data.Collections.CollectionNftsData;
    };
    export type CollectionNftData = {
        id: number;
        collectionId: number;
        name: string | null;
        tokenNumber: string;
        images: App.Data.Nfts.NftImagesData;
        traits: Array<App.Data.Collections.CollectionTraitData>;
    };
    export type CollectionNftsData = {
        paginated: Array<App.Data.Collections.CollectionNftData>;
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
        nftsCount: number;
        nftsPercentage: number;
    };
    export type CollectionTraitFilterData = {
        name: string;
        value: string;
        displayType: string;
        nftsCount: number;
    };
}
declare namespace App.Data.Gallery {
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
    export type GalleryCollectionData = {
        name: string;
        slug: string;
        address: string;
        chainId: App.Enums.Chains;
        floorPrice: string | null;
        floorPriceFiat: number | null;
        floorPriceCurrency: string | null;
        floorPriceDecimals: number | null;
        image: string | null;
        banner: string | null;
        bannerUpdatedAt: string | null;
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
        wallet: App.Data.Gallery.GalleryWalletData;
        nfts: App.Data.Gallery.GalleryNftsData;
        isOwner: boolean;
        hasLiked: boolean;
    };
    export type GalleryLikeData = {
        likes: number;
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
    export type GalleryWalletData = {
        address: string;
        domain: string | null;
        avatar: App.Data.Wallet.WalletAvatarData;
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
        chainId: App.Enums.Chains;
        floorPrice: string | null;
        website: string;
        image: string | null;
    };
    export type NftData = {
        id: number;
        name: string | null;
        tokenNumber: string;
        collection: App.Data.Nfts.NftCollectionData;
        images: App.Data.Nfts.NftImagesData;
        wallet: App.Data.Nfts.NftWalletData | null;
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
    export type NftWalletData = {
        address: string;
    };
}
declare namespace App.Data.Token {
    export type TokenData = {
        address: string;
        isNativeToken: boolean;
        isDefaultToken: boolean;
        chainId: App.Enums.Chains;
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
        nfts: WalletNftData[];
        nftCount: number;
        collectionCount: number;
        collectionsValue: number | null;
        galleryCount: number;
        timestamps: { tokens_fetched_at: number | null; native_balances_fetched_at: number | null };
    };
    export type WalletNftData = {
        id: number;
        images: App.Data.ImagesData;
    };
}
declare namespace App.Data.Web3 {
    export type Web3ContractMetadata = {
        contractAddress: string;
        collectionName: string;
        totalSupply: string;
        collectionSlug: string | null;
        imageUrl: string | null;
        floorPrice: number | null;
        bannerImageUrl: string | null;
        description: string | null;
    };
    export type Web3Erc20TokenData = {
        tokenAddress: string;
        networkId: number;
        ownedByAddress: string | null;
        name: string | null;
        symbol: string | null;
        decimals: number | null;
        logo: string | null;
        thumbnail: string | null;
        balance: string | null;
    };
    export type Web3NftCollectionFloorPrice = {
        price: string;
        currency: string;
        retrievedAt: string;
    };
    export type Web3NftCollectionTrait = {
        name: string;
        value: string;
        valueMin: number | null;
        valueMax: number | null;
        nftsCount: string;
        nftsPercentage: number;
        displayType: any;
    };
    export type Web3NftData = {
        tokenAddress: string;
        tokenNumber: string;
        networkId: number;
        collectionName: string;
        collectionSymbol: string;
        collectionImage: string | null;
        collectionWebsite: string | null;
        collectionDescription: string | null;
        collectionBannerImageUrl: string | null;
        collectionBannerUpdatedAt: string | null;
        collectionSocials: Array<any> | null;
        collectionSupply: number | null;
        name: string | null;
        description: string | null;
        extraAttributes: Array<any>;
        floorPrice: App.Data.Web3.Web3NftCollectionFloorPrice | null;
        traits: Array<any>;
        mintedBlock: number;
        mintedAt: string | null;
    };
    export type Web3NftTransfer = {
        contractAddress: string;
        tokenId: string;
        sender: string;
        recipient: string;
        txHash: string;
        type: App.Enums.NftTransferType;
        timestamp: string;
        totalNative: number | null;
        totalUsd: number | null;
        extraAttributes: Array<any>;
    };
    export type Web3NftsChunk = {
        nfts: any;
        nextToken: string | null;
    };
}
declare namespace App.Enums {
    export type Chains = 1 | 5 | 137 | 80001;
    export type NftTransferType = "LABEL_MINT" | "LABEL_SALE" | "LABEL_TRANSFER";
    export type Platforms = "ethereum" | "polygon-pos";
}
