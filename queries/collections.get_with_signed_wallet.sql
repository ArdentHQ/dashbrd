WITH signed_wallets AS (
	SELECT
		id
	FROM
		wallets
	WHERE
		last_signed_at IS NOT NULL
),
distinct_collection_ids AS (
	SELECT
		distinct_collections.id
	FROM
		signed_wallets
		JOIN LATERAL ( SELECT DISTINCT
				collection_id
			FROM
				nfts
			WHERE
				nfts.wallet_id = signed_wallets.id) distinct_collections (id) ON TRUE
)
SELECT
	c.*
FROM
	distinct_collection_ids
	JOIN collections c USING (id)