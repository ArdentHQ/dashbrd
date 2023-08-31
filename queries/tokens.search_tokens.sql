WITH all_tokens AS (
	SELECT
		tokens.id,
		tokens.name,
		tokens.symbol,
		tokens.token_guid as guid,
		tokens.decimals,
		tokens.address,
		tokens.is_native_token,
		balances.balance,
		networks.chain_id AS chain_id,
		networks.id AS network_id,
		COALESCE(tokens.extra_attributes -> 'images' ->> 'small',
			tokens.extra_attributes -> 'images' ->> 'large',
			tokens.extra_attributes -> 'images' ->> 'thumb') AS logo_url
	FROM
		balances
		INNER JOIN tokens ON tokens.id = balances.token_id
		INNER JOIN networks ON tokens.network_id = networks.id
		LEFT JOIN spam_tokens ON spam_tokens.token_id = tokens.id
	WHERE
		balances.wallet_id = {{ $walletId }}
		AND balances.wallet_id IS NOT NULL
		AND spam_tokens.token_id IS NULL
        AND networks.chain_id IN ({{ $chainIds }})
		AND balances.balance > 0
		AND (tokens.name ILIKE {{ $query }} OR tokens.symbol ILIKE {{ $query }})
	GROUP BY
		tokens.id,
		networks.id,
        balances.id
)
SELECT
	name,
	symbol,
	0 AS token_price,
    guid,
	address,
	is_native_token,
	balance,
	decimals,
	chain_id,
	network_id,
	0 AS minted_supply,
	0 AS total_market_cap,
	0 AS ath,
	0 AS atl,
	0 AS total_volume,
	0 AS fiat_balance,
	0 AS price_change_24h_in_currency,
	'' AS website_url,
	'' AS twitter_url,
	'' AS discord_url,
	'' AS explorer_url,
	logo_url,
    0 AS percentage
FROM
	all_tokens
ORDER BY
	balance DESC NULLS LAST
LIMIT {{ $limit }}
