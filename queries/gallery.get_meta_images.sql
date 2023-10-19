SELECT
	CONCAT("galleries".slug, '_', MD5(CONCAT(string_agg(CAST(sub.nft_id AS VARCHAR), '.'), '_', "galleries".name)), '.png') AS image_name
FROM
	"galleries"
	INNER JOIN (
		SELECT
			"nft_gallery"."gallery_id",
			"nft_gallery"."nft_id",
			ROW_NUMBER() OVER (PARTITION BY "nft_gallery"."gallery_id" ORDER BY "nft_gallery"."order_index" ASC) AS rn
		FROM
			"nft_gallery"
		WHERE
			"nft_gallery"."gallery_id" IN(
			SELECT
				id FROM "galleries"
			WHERE
				"deleted_at" IS NULL)) AS sub ON sub. "gallery_id" = "galleries"."id"
	WHERE
		sub.rn <= 4
		AND "galleries"."deleted_at" IS NULL
	GROUP BY
		"galleries".id;