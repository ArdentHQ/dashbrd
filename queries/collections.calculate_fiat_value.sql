(
    SELECT
        COALESCE(
            json_object_agg(
                upper(cte.currency),
                cte.fiat_value
            ),
            '{}'::json
        ) AS result
    FROM (
        SELECT
            COALESCE(
                SUM(
                    COALESCE(
                        c.floor_price * (token_prices.value::text)::numeric / (10 ^ tokens.decimals),
                        0
                    )
                ),
                0
            ) AS fiat_value,
            token_prices.key as currency
        FROM
            collections as c
            JOIN tokens ON tokens.id = c.floor_price_token_id,
                json_each(tokens.extra_attributes -> 'market_data' -> 'current_prices') AS token_prices
        WHERE
            collections.id = c.id
        GROUP BY
            token_prices.key
    ) AS cte
)
