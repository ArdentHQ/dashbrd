<?php

declare(strict_types=1);

namespace App\Data\Token;

use App\Data\ImagesData;
use App\Enums\CurrencyCode;
use App\Models\Token;
use Illuminate\Support\Facades\Auth;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class TokenData extends Data
{
    /**
     * @param  array{website: string|null, discord: string|null, twitter: string|null}  $socials
     * @param  array{market_cap: string,total_volume: string,minted_supply: string|null,ath: string,atl: string}  $marketData
     */
    public function __construct(
        public string $address,
        public bool $isNativeToken,
        public bool $isDefaultToken,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public ?int $guid,
        public string $name,
        public string $symbol,
        public int $decimals,
        public ImagesData $images,
        public ?float $marketCap,
        public ?float $volume,
        #[LiteralTypeScriptType('{ website: string | null; discord: string | null; twitter: string | null; }')]
        public array $socials,
        #[LiteralTypeScriptType('{
            market_cap: string|null;
            total_volume: string|null;
            minted_supply: string|null;
            ath: string|null;
            atl: string|null;
        }')]
        public array $marketData,
    ) {
    }

    public static function fromModel(Token $token): self
    {
        $currency = Auth::user()?->currency() ?? CurrencyCode::USD;

        return new self(
            address: $token->address,
            isNativeToken: $token->is_native_token,
            isDefaultToken: $token->is_default_token,
            chainId: $token->network->chain_id,
            guid: $token->token_guid,
            name: $token->name,
            symbol: $token->symbol,
            decimals: $token->decimals,
            images: ImagesData::from($token->images()),
            marketCap: $token->marketCap($currency),
            volume: $token->volume($currency),
            socials: $token->socials(),
            marketData: $token->marketData(),
        );
    }
}
