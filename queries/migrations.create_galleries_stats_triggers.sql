ALTER TABLE galleries_stats
    ADD CONSTRAINT positive_stats CHECK (
                total_galleries >= 0 AND total_distinct_users >= 0 AND
                total_distinct_collections >= 0 AND total_distinct_nfts >= 0
        );

INSERT INTO galleries_stats (total_galleries, total_distinct_users, total_distinct_collections, total_distinct_nfts, created_at, updated_at)
VALUES (0, 0, 0, 0, NOW(), NOW());

CREATE OR REPLACE FUNCTION on_galleries_distinct_nft_change() RETURNS TRIGGER AS $_$
BEGIN
    IF TG_OP = 'INSERT' THEN

        INSERT INTO galleries_distinct_collections (collection_id)
        SELECT DISTINCT collection_id
        FROM nfts WHERE id IN (SELECT nft_id FROM delta)
            ON CONFLICT (collection_id) DO NOTHING;

        ELSEIF TG_OP = 'DELETE' THEN

        WITH affected_collections AS (
            SELECT collection_id FROM nfts
            WHERE id IN (SELECT nft_id FROM delta)
            GROUP BY collection_id
        ), agg_gallery_collection_nft_counts AS (
            SELECT collection_id, SUM(
                CASE WHEN EXISTS(SELECT 1 FROM nft_gallery ng WHERE nfts.id = ng.nft_id) THEN 1 ELSE 0 END
            ) AS total
            FROM affected_collections af
            JOIN nfts USING (collection_id)
            GROUP BY collection_id
        )
        DELETE FROM galleries_distinct_collections
        WHERE collection_id IN (
            SELECT collection_id
            FROM agg_gallery_collection_nft_counts
            WHERE total = 0
        );

END IF;

RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE TRIGGER on_galleries_distinct_nft_insert
    AFTER INSERT ON galleries_distinct_nfts
    REFERENCING NEW TABLE AS delta
    FOR EACH STATEMENT
    EXECUTE PROCEDURE on_galleries_distinct_nft_change();

CREATE TRIGGER on_galleries_distinct_nft_delete
    AFTER DELETE ON galleries_distinct_nfts
    REFERENCING OLD TABLE AS delta
    FOR EACH STATEMENT
    EXECUTE PROCEDURE on_galleries_distinct_nft_change();

CREATE OR REPLACE FUNCTION on_galleries_insert() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_galleries = total_galleries + 1, updated_at = NOW();
RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_galleries_delete() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_galleries = total_galleries - 1, updated_at = NOW();
RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_galleries_distinct_users_insert() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_distinct_users = total_distinct_users + 1, updated_at = NOW();
RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_galleries_distinct_users_delete() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_distinct_users = total_distinct_users - 1, updated_at = NOW();
RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_galleries_distinct_collections_insert() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_distinct_collections = total_distinct_collections + 1, updated_at = NOW();

RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_galleries_distinct_collections_delete() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_distinct_collections = total_distinct_collections - 1, updated_at = NOW();
RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_galleries_distinct_nfts_insert() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_distinct_nfts = total_distinct_nfts + 1, updated_at = NOW();
RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION on_galleries_distinct_nfts_delete() RETURNS TRIGGER AS $_$
BEGIN
UPDATE galleries_stats SET total_distinct_nfts = total_distinct_nfts - 1, updated_at = NOW();
RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE TRIGGER on_galleries_insert_row
    AFTER INSERT ON galleries
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_insert();

CREATE TRIGGER on_galleries_delete_row
    AFTER DELETE ON galleries
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_delete();

CREATE TRIGGER on_galleries_distinct_users_insert_row
    AFTER INSERT ON galleries_distinct_users
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_distinct_users_insert();

CREATE TRIGGER on_galleries_distinct_users_delete_row
    AFTER DELETE ON galleries_distinct_users
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_distinct_users_delete();

CREATE TRIGGER on_galleries_distinct_collections_insert_row
    AFTER INSERT ON galleries_distinct_collections
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_distinct_collections_insert();

CREATE TRIGGER on_galleries_distinct_collections_delete_row
    AFTER DELETE ON galleries_distinct_collections
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_distinct_collections_delete();

CREATE TRIGGER on_galleries_distinct_nfts_insert_row
    AFTER INSERT ON galleries_distinct_nfts
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_distinct_nfts_insert();

CREATE TRIGGER on_galleries_distinct_nft_delete_row
    AFTER DELETE ON galleries_distinct_nfts
    FOR EACH ROW
    EXECUTE PROCEDURE on_galleries_distinct_nfts_delete();