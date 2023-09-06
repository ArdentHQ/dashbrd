<?php

declare(strict_types=1);

namespace App\Support;

use App\Enums\Chains;
use App\Enums\Platforms;
use App\Models\CoingeckoToken;
use App\Models\Token;
use Illuminate\Support\Str;

final class TokenSpam
{
    /**
     * @return array{ isSpam: boolean, reason: ?string }
     */
    public static function evaluate(Token $token): array
    {
        // Some heuristics to determine whether a token is likely spam or not.
        // Kept very simple for now, can be extended as needed.

        // If it's a testnet token, we skip the Coingeciko check
        if ($token->network->is_mainnet) {
            // If the token is in the official coingecko list, we first need to check if the address matches an existing network
            $coingeckoLookupToken = CoingeckoToken::lookupByToken($token);

            if ($coingeckoLookupToken) {
                $isAddressValid = self::validateAddressByNetwork($token, $coingeckoLookupToken);

                if (! $isAddressValid) {
                    return self::spam('coingecko address mismatch');
                }

                return self::noSpam();
            } elseif (config('dashbrd.token_spam.filter_type') === 'strict') {
                // However, if we have strict token spam filter on, we ignore anything not on coingecko
                return self::spam('coingecko mismatch');
            }
        }

        $name = $token->name;
        $symbol = $token->symbol;

        $maxSymbolLength = intval(config('dashbrd.token_spam.max_symbol_length'));
        if ($maxSymbolLength < Str::length($symbol)) {
            return self::spam('symbol too long');
        }

        $maxNameLength = intval(config('dashbrd.token_spam.max_name_length'));
        if ($maxNameLength < Str::length($name)) {
            return self::spam('name too long');
        }

        return self::noSpam();
    }

    /**
     * @return array{ isSpam: boolean, reason: ?string }
     */
    private static function noSpam(): array
    {
        return ['isSpam' => false, 'reason' => null];
    }

    /**
     * @return array{ isSpam: boolean, reason: ?string }
     */
    private static function spam(string $reason): array
    {
        return ['isSpam' => true, 'reason' => $reason];
    }

    /**
     * @param  Token  $token - the token we are checking
     * @param  mixed  $addressByNetwork - json_decode of the platforms field from coingecko
     * @param  string  $network - the network we are checking
     */
    private static function matchesCoingeckoTokenAddress(Token $token, mixed $addressByNetwork, string $network): bool
    {
        if (! empty($addressByNetwork) && property_exists($addressByNetwork, $network) && $addressByNetwork->{$network} !== $token->address) {
            return false;
        }

        return true;
    }

    /**
     * @param  Token  $token - the token we are checking
     * @param  CoingeckoToken  $coingeckoToken - the coingecko token we are checking against
     */
    private static function validateAddressByNetwork(Token $token, CoingeckoToken $coingeckoToken): bool
    {
        $addressByNetwork = json_decode($coingeckoToken->platforms);
        $isTokenValid = true;

        if ($token->network->chain_id == Chains::Polygon->value) {
            $isTokenValid = self::matchesCoingeckoTokenAddress($token, $addressByNetwork, Platforms::Polygon->value);
        } elseif ($token->network->chain_id == Chains::ETH->value) {
            $isTokenValid = self::matchesCoingeckoTokenAddress($token, $addressByNetwork, Platforms::Ethereum->value);
        }

        return $isTokenValid;
    }
}
