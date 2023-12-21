WITH RankedCollections AS (
    SELECT 
        collections.id,
        COUNT(Distinct cv.id) as votes_count,
        ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT cv.id) DESC, collections.volume DESC NULLS LAST) AS new_rank
    FROM 
        collections
    LEFT JOIN 
        collection_votes cv ON cv.collection_id = collections.id
        AND cv.voted_at BETWEEN DATE_TRUNC('month', CURRENT_DATE) AND (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 MONTH' - INTERVAL '1 day')
    GROUP BY 
        collections.id
)
UPDATE 
    collections
SET 
    monthly_rank = ranked_collections.new_rank,
    monthly_votes = ranked_collections.votes_count
FROM 
    RankedCollections ranked_collections
WHERE 
    collections.id = ranked_collections.id;
