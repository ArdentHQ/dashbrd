<?php

declare(strict_types=1);

namespace App\Http\Client\Moralis;

use App\Data\NetworkData;
use App\Data\Wallet\WalletBalance;
use App\Data\Wallet\WalletData;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chains;
use App\Enums\MoralisChain;
use App\Enums\TokenType;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\NftImageUrl;
use Carbon\Carbon;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Http\Client\ConnectionException as LaravelConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Throwable;

class MoralisPendingRequest extends PendingRequest
{
    protected string $apiUrl;

    /**
     * Create a new HTTP Client instance.
     *
     * @return void
     */
    public function __construct(Factory $factory = null)
    {
        parent::__construct($factory);

        $this->apiUrl = config('services.moralis.endpoint');

        $this->options = [
            'headers' => [
                'Accepts' => 'application/json',
                'X-API-Key' => config('services.moralis.key'),
            ],
        ];
    }

    /**
     * Send the request to the given URL.
     *
     * @param  array<mixed>  $options
     *
     * @throws \Exception
     */
    public function send(string $method, string $path, array $options = []): Response
    {
        $url = $this->apiUrl.$path;

        try {
            return parent::send($method, $url, $options);
        } catch (Throwable $e) {
            if ($e instanceof LaravelConnectionException || $e instanceof ServerException) {
                throw new ConnectionException('Moralis', $url, $e->getCode());
            }

            if ($e instanceof ClientException && $e->getCode() === 429) {
                $retryAfter = $e->getResponse()->getHeader('Retry-After')[0] ?? 30;

                throw new RateLimitException((int) $retryAfter);
            }

            throw $e;
        }
    }

    /**
     * @see https://docs.moralis.io/web3-data-api/reference/get-wallet-token-balances
     *
     * @param array{
     *   to_block?: number,
     *   token_addresses?: array<string>,
     * } $query
     * @return Collection<int, Web3Erc20TokenData>
     */
    public function erc20(WalletData $wallet, NetworkData $network, array $query = []): Collection
    {
        $chain = MoralisChain::fromChainId($network->chainId);

        /** @var array<int, array{
         *  token_address: string,
         *  name: string,
         *  symbol: string,
         *  logo: string|null,
         *  thumbnail: string|null,
         *  decimals: int,
         *  balance: string,
         * }> $data
         **/
        $data = self::get($wallet->address.'/erc20', [
            'chain' => $chain->value,
            ...$query,
        ])->json();

        return collect($data)->map(function ($token) use ($wallet, $network) {
            return new Web3Erc20TokenData(
                $token['token_address'],
                $network->id,
                $wallet->address,
                $token['name'],
                $token['symbol'],
                $token['decimals'],
                $token['logo'],
                $token['thumbnail'],
                $token['balance'],
            );
        });
    }

    /**
     * @see https://docs.moralis.io/web3-data-api/evm/reference/get-wallet-nfts
     */
    public function walletNfts(WalletData $wallet, NetworkData $network, ?string $cursor): Web3NftsChunk
    {
        $chain = MoralisChain::fromChainId($network->chainId);

        $data = self::get($wallet->address.'/nft', [
            'chain' => $chain->value,
            'format' => 'decimal',
            'normalizeMetadata' => 'true',
            'media_items' => 'true',
            'cursor' => $cursor,
        ])->json();

        /** @var array<int, mixed> $result */
        $result = $data['result'];

        $nfts = collect($result)->filter(fn ($nft) => $this->filterNft($nft));

        // NOTE: unlike Alchemy, Moralis does not include price info in the 'owned nfts' request,
        // so a separate request is needed to get the floor price (usually mnemonic)

        $nfts = $nfts->map(function ($nft) use ($network) {
            $extraAttributes = $this->getNftExtraAttributes($nft);

            return new Web3NftData(
                tokenAddress: $nft['token_address'],
                tokenNumber: $nft['token_id'],
                networkId: $network->id,
                collectionName: $nft['name'] ?? $nft['symbol'],
                collectionSymbol: $nft['symbol'] ?? $nft['name'],
                // moralis doesn't provide collection images - so reuse NFT image
                collectionImage: Arr::get($extraAttributes, 'images.large'),
                collectionWebsite: $nft['normalized_metadata']['external_link'] ?? null,
                collectionDescription: null,
                collectionBannerImageUrl: null,
                collectionBannerUpdatedAt: null,
                collectionSocials: null,
                collectionSupply: null,
                name: $this->getNftName($nft),
                description: $nft['normalized_metadata']['description'] ?? null,
                extraAttributes: $extraAttributes,
                floorPrice: null,
                traits: [],
                mintedBlock: (int) $nft['block_number_minted'],
                mintedAt: null,
            );
        })->values();

        return new Web3NftsChunk(
            nfts: $nfts,
            nextToken: Arr::get($data, 'cursor'),
        );
    }

    /**
     * @see https://docs.moralis.io/web3-data-api/reference/resolve-address
     */
    public function ensDomain(Wallet $wallet): ?string
    {
        try {
            return self::get(sprintf('resolve/%s/reverse', $wallet->address))->json('name');
        } catch (ClientException $e) {
            if ($e->getCode() === 404) {
                return null;
            }

            throw $e;
        }
    }

    /**
     * @see https://docs.moralis.io/web3-data-api/evm/reference/get-native-balance
     */
    public function getNativeBalance(Wallet $wallet, Network $network): string
    {
        $chain = MoralisChain::fromChainId($network->chain_id);

        return self::get(sprintf('%s/balance?chain=%s', $wallet->address, $chain->value))->json('balance');
    }

    /**
     * @see https://docs.moralis.io/web3-data-api/evm/reference/get-native-balances-for-addresses
     *
     * @param  array<string>  $walletAddresses
     * @return Collection<int, WalletBalance>
     */
    public function getNativeBalances(array $walletAddresses, Network $network): Collection
    {
        $chain = MoralisChain::fromChainId($network->chain_id);

        $query = http_build_query([
            'wallet_addresses' => $walletAddresses,
            'chain' => $chain->value,
        ]);

        $balances = self::get(sprintf('wallets/balances?%s', $query))->json('0.wallet_balances');

        return collect($balances)->map(function ($balance) {
            return new WalletBalance(
                address: $balance['address'],
                balance: $balance['balance'],
                formattedBalance: $balance['balance_formatted']
            );
        });
    }

    /**
     * @see https://docs.moralis.io/web3-data-api/evm/reference/get-nft-lowest-price
     * Get the lowest executed price for an NFT contract for the last x days (only trades paid in ETH).
     */
    public function getNftCollectionFloorPrice(Chains $chain, string $contractAddress): ?Web3NftCollectionFloorPrice
    {
        try {
            $data = self::get(sprintf('nft/%s/lowestprice', $contractAddress), [
                'chain' => MoralisChain::fromChainId($chain->value)->value,
            ])->json();

            return new Web3NftCollectionFloorPrice(
                $data['price'],
                'eth', // always eth for moralis
                Carbon::parse($data['block_timestamp']),
            );
        } catch (ClientException $e) {
            if ($e->getCode() === 404) {
                return null;
            }

            throw $e;
        }
    }

    public function getBlockTimestamp(Network $network, int $blockNumber): Carbon
    {
        $chain = MoralisChain::fromChainId($network->chain_id);

        $response = self::get('block/'.$blockNumber, [
            'chain' => $chain->value,
        ])->json();

        return Carbon::parse($response['timestamp']);
    }

    /**
     * @param  array<string, mixed>  $nft
     * @return array{images: array{thumb: string | null, small: string | null, large: string | null, original: string | null, originalRaw: string | null}}
     */
    private function getNftExtraAttributes(array $nft): array
    {
        $imageUrl = $this->tryExtractImage($nft);

        $images = array_merge(
            NftImageUrl::getAllSizes($imageUrl),
            $this->tryExtractAssetUrls($nft)
        );

        return ['images' => $images];
    }

    /**
     * This method extracts original asset URLs from the NFT data.
     * originalRawUrl - null - as there is no such property in the
     * API response.
     * originalUrl - Public gateway uri for the raw uri above.
     * For more @see https://docs.moralis.io/web3-data-api/evm/reference/get-wallet-nfts?
     *
     * @param  array<string, mixed>  $nft
     * @return array{originalRaw: string | null, original: string | null}
     */
    private function tryExtractAssetUrls(array $nft): array
    {
        return [
            'originalRaw' => null,
            'original' => Arr::get($nft, 'media.original_media_url'),
        ];
    }

    /**
     * @param  array<string, mixed>  $nft
     */
    private function tryExtractImage(array $nft): ?string
    {
        $imageUrl = Arr::get($nft, 'media.media_collection.high.url');
        if (! empty($imageUrl)) {
            return $imageUrl;
        }

        return Arr::get($nft, 'normalized_metadata.image');
    }

    /**
     * @param  array<string, mixed>  $nft
     */
    private function getNftName(array $nft): ?string
    {
        // Intrinsic name has priority over any other name
        $name = Arr::get($nft, 'normalized_metadata.name');
        if (! empty($name)) {
            return $name;
        }

        // when the name is missing, marketplaces typically show "#tokenId" or similar.
        // Instead of forcing a specific name, we let the frontend decide.
        return null;
    }

    private function filterNft(mixed $nft): bool
    {
        if (Arr::get($nft, 'possible_spam', false)) {
            return false;
        }

        if (! TokenType::compare(TokenType::Erc721, Arr::get($nft, 'contract_type', ''))) {
            return false;
        }

        // Only one has to exist, the missing one gets substituted
        $hasCollectionName = ! empty(Arr::get($nft, 'name'));
        $hasCollectionSymbol = ! empty(Arr::get($nft, 'symbol'));

        if (! $hasCollectionName && ! $hasCollectionSymbol) {
            return false;
        }

        return true;
    }
}
