SELECT
    COALESCE(SUM(COALESCE(balances.balance * (token_prices.value::text)::numeric / (10 ^ tokens.decimals), 0)), 0) AS total_balance
FROM
    "balances"
    INNER JOIN "tokens" ON "tokens"."id" = balances.token_id
    LEFT JOIN "spam_tokens" ON "spam_tokens"."token_id" = "tokens"."id",
    json_each(tokens.extra_attributes -> 'market_data' -> 'current_prices') AS token_prices
WHERE
    "balances"."wallet_id" = {{ $walletId }}
    AND "balances"."wallet_id" IS NOT NULL
    AND "token_prices"."key" = '{{ $currency }}'
    AND "spam_tokens"."token_id" IS NULL
    AND "spam_tokens"."token_id" IS NULL
    AND "tokens"."network_id" IN ({{ $networkIds }})
