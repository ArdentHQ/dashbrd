WITH all_tokens AS (
	SELECT
		tokens.id,
		tokens.name,
		tokens.symbol,
		tokens.token_guid as guid,
		tokens.decimals,
		tokens.address,
		tokens.is_native_token,
		COALESCE(MAX((token_prices.value::text)::numeric), 0) AS token_price,
		balances.balance,
		networks.chain_id AS chain_id,
		networks.id AS network_id,
		tokens.extra_attributes -> 'market_data' ->> 'minted_supply' AS minted_supply,
		(tokens.extra_attributes -> 'market_data' -> 'market_cap' ->> '{{ $currency }}')::numeric AS total_market_cap,
		tokens.extra_attributes -> 'market_data' -> 'ath' ->> '{{ $currency }}' AS ath,
		tokens.extra_attributes -> 'market_data' -> 'atl' ->> '{{ $currency }}' AS atl,
		(tokens.extra_attributes -> 'market_data' -> 'total_volume' ->> '{{ $currency }}')::numeric AS total_volume,
		tokens.extra_attributes -> 'market_data' -> 'price_change_24h_in_currency' ->> '{{ $currency }}' AS price_change_24h_in_currency,
		tokens.extra_attributes -> 'socials' ->> 'website' AS website_url,
		CASE
            WHEN tokens.extra_attributes -> 'socials' ->> 'twitter' IS NOT NULL THEN
                CONCAT('https://x.com/', tokens.extra_attributes -> 'socials' ->> 'twitter')
            ELSE
                NULL  -- or any default value you want to use when the twitter URL is NULL
        END AS twitter_url,
		tokens.extra_attributes -> 'socials' ->> 'discord' AS discord_url,
		CONCAT(networks.explorer_url,
			'/token/',
			tokens.address) AS explorer_url,
		COALESCE(tokens.extra_attributes -> 'images' ->> 'small',
			tokens.extra_attributes -> 'images' ->> 'large',
			tokens.extra_attributes -> 'images' ->> 'thumb') AS logo_url,
		CASE WHEN MAX((token_prices.value::text)::numeric) IS NULL THEN
			NULL
		ELSE
			SUM(COALESCE(balances.balance * (token_prices.value::text)::numeric / (10 ^ tokens.decimals),
					0))
		END AS fiat_balance
	FROM
		balances
		INNER JOIN tokens ON tokens.id = balances.token_id
		INNER JOIN networks ON tokens.network_id = networks.id
		LEFT JOIN spam_tokens ON spam_tokens.token_id = tokens.id
		LEFT JOIN json_each(tokens.extra_attributes -> 'market_data' -> 'current_prices') AS token_prices ON TRUE
	WHERE
		balances.wallet_id = {{ $walletId }}
		AND balances.wallet_id IS NOT NULL
		AND (token_prices.key = '{{ $currency }}' or token_prices.key is null)
		AND spam_tokens.token_id IS NULL
        AND networks.chain_id IN ({{ $chainIds }})
	GROUP BY
		tokens.id,
		networks.id,
        balances.id
)
SELECT
	id,
	name,
	symbol,
	token_price,
  guid,
	address,
	is_native_token,
	balance,
	decimals,
	chain_id,
	network_id,
	minted_supply,
	total_market_cap,
	ath,
	atl,
	total_volume,
	fiat_balance,
	price_change_24h_in_currency,
	website_url,
	twitter_url,
	discord_url,
	explorer_url,
	logo_url,
    CASE
        WHEN fiat_balance > 0 THEN
            COALESCE(
                COALESCE(fiat_balance, 0) / (SELECT SUM(fiat_balance) FROM all_tokens)
            , 0)
        ELSE 0
    END AS percentage
FROM
	all_tokens
GROUP BY id, network_id, chain_id, balance, token_price, fiat_balance, guid, address, is_native_token, decimals, name, symbol, minted_supply, total_market_cap, ath, atl, total_volume, price_change_24h_in_currency, website_url, twitter_url, discord_url, explorer_url, logo_url
ORDER BY
	{{ $sortBy }} {{ $sortDirection }} {{ $nullDirection }}
OFFSET {{ $offset }}
LIMIT {{ $limit }}
