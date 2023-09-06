(
    SELECT
        COALESCE(
            json_object_agg(
                upper(cte.currency),
                cte.floor_price
            ),
            '{}'::json
        ) AS result
    FROM (
        SELECT
            SUM(
                CASE WHEN collections.floor_price IS NULL THEN NULL ELSE collections.floor_price * (token_prices.value::text)::numeric / (10 ^ tokens.decimals) END
            ) AS floor_price,
            token_prices.key as currency
        FROM
            nft_gallery
            LEFT JOIN nfts ON nft_gallery.nft_id = nfts.id
            LEFT JOIN collections ON nfts.collection_id = collections.id
            JOIN tokens ON tokens.id = collections.floor_price_token_id,
            json_each(tokens.extra_attributes -> 'market_data' -> 'current_prices') AS token_prices
        WHERE
            nft_gallery.gallery_id = galleries.id
        GROUP BY
            token_prices.key
    ) AS cte
)
