/**
* IMPORTANT: Ensure this query is in sync with the method in `app/Http/Controllers/MetaImageController.php@getImageName`
*/
SELECT
	CONCAT(
		"galleries".slug,
		'_',
		MD5(CONCAT(
			string_agg(CAST(sub.nft_id AS VARCHAR), '.'),
			'_',
			count(sub.nft_id),
			'_',
			"galleries".name
		)), '.png') AS image_name
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