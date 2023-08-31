<?php

declare(strict_types=1);

namespace App\Support;

class Queues
{
    // Queues for scheduled jobs...
    //  - scheduled-default: SQL calculations, updating currencies, fetching price history. Has the highest priority just because it's very fast and runs rarely.
    //  - scheduled-wallet-nfts: Fetching wallet NFTs. Has medium priority.
    //  - scheduled-nfts: Fetching collection NFTs, NFT activites, floor price. Runs daily/hourly.
    //  - scheduled-collections: Fetching collection NFTs, volume, owners, traits and banners. Runs daily/weekly and runs fast so it has low priority.

    public const SCHEDULED_DEFAULT = 'scheduled-default';

    public const SCHEDULED_WALLET_NFTS = 'scheduled-wallet-nfts';

    public const SCHEDULED_NFTS = 'scheduled-nfts';

    public const SCHEDULED_COLLECTIONS = 'scheduled-collections';

    /**
     * @return string[]
     */
    public static function scheduled(): array
    {
        // Priority depends on the order: low -> high...

        return [
            static::SCHEDULED_DEFAULT,
            static::SCHEDULED_WALLET_NFTS,
            static::SCHEDULED_NFTS,
            static::SCHEDULED_COLLECTIONS,
        ];
    }

    // High-throughput queues...
    //  - wallets: Updating ENS details, fetch native balances. Runs very often and has the high priority.
    //  - tokens: Fetching tokens, updating token details
    //  - nfts: Refreshing metadata, fetching collection floor price

    public const WALLETS = 'wallets';

    public const TOKENS = 'tokens';

    public const NFTS = 'nfts';

    /**
     * @return string[]
     */
    public static function highThroughput(): array
    {
        // Priority depends on the order: low -> high...

        return [
            static::WALLETS,
            static::TOKENS,
            static::NFTS,
        ];
    }

    // Regular queues...
    //  - priority: Indexing active wallets. Highest priority queue.
    //  - default: Sending notifications, indexing inactive wallets. Lowest priority.

    public const PRIORITY = 'priority';

    public const DEFAULT = 'default';

    /**
     * @return string[]
     */
    public static function regular(): array
    {
        // Priority depends on the order: low -> high...

        return [
            static::PRIORITY,
            static::DEFAULT,
        ];
    }
}
