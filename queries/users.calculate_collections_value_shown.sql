(SELECT
    COALESCE(
        json_object_agg(
            upper(cte.currency),
            cte.floor_price
        ),
        '{}'::json
    ) AS result
FROM (
    SELECT
        COALESCE(
            SUM(
                COALESCE(
                    user_collections.floor_price * (token_prices.value::text)::numeric / (10 ^ tokens.decimals),
                    0
                )
            ),
            0
        ) AS floor_price,
        token_prices.key as currency
    FROM
        (
            SELECT collections.id, floor_price, floor_price_token_id, wallets.user_id
            FROM collections
            LEFT JOIN nfts on nfts.collection_id = collections.id
            LEFT JOIN wallets ON nfts.wallet_id = wallets.id
            @if (count($hiddenCollectionIds) > 0)
            WHERE collections.id NOT IN ({{ implode(',', $hiddenCollectionIds) }})
            @endif
        ) as user_collections
        JOIN tokens ON tokens.id = user_collections.floor_price_token_id,
            json_each(tokens.extra_attributes -> 'market_data' -> 'current_prices') AS token_prices
    WHERE
        user_collections.user_id = users.id
    GROUP BY
        token_prices.key
) AS cte)
