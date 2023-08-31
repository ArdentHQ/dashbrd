(
	SELECT
		((COALESCE(MAX(likes_count), 0) * %d) + (COALESCE(MAX(views_count), 0) * %d)) AS score
	FROM (
		SELECT
            "g"."id" as "gallery_id",
            "likes_count",
            "views_count"
        FROM
            "galleries" AS "g"
            LEFT JOIN (
                SELECT
                    "gallery_id",
                    COUNT("user_id") AS likes_count
                FROM
                    "gallery_likes"
                GROUP BY
                    "gallery_id") AS "l" ON "l"."gallery_id" = "g"."id"
            LEFT JOIN (
                SELECT
                    "viewable_id",
                    COUNT(DISTINCT (visitor)) AS views_count
                FROM
                    "views"
                WHERE
                    "viewable_type" = '%s'
                GROUP BY
                    "viewable_id") AS "v" ON "v"."viewable_id" = "g"."id"
    ) AS "gallery_values"
	WHERE
		"gallery_id" = "galleries"."id"
    GROUP BY
        "galleries"."id"
)
