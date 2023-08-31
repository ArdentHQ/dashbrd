CREATE OR REPLACE FUNCTION on_gallery_change() RETURNS TRIGGER AS $_$
BEGIN

    IF TG_TABLE_NAME = 'nft_gallery' THEN
        -- mark individual galleries as dirty for cache invalidation
        INSERT INTO galleries_dirty (gallery_id)
        SELECT DISTINCT gallery_id FROM delta
        ON CONFLICT (gallery_id) DO NOTHING;

        -- update distinct nfts
        IF TG_OP = 'INSERT' THEN

            INSERT INTO galleries_distinct_nfts (nft_id)
            SELECT DISTINCT nft_id FROM delta
            ON CONFLICT DO NOTHING;

        ELSEIF TG_OP = 'DELETE' THEN

            DELETE FROM galleries_distinct_nfts
            WHERE nft_id IN (SELECT DISTINCT nft_id FROM delta);

        END IF;

    ELSEIF TG_TABLE_NAME = 'galleries' THEN

        -- mark individual galleries as dirty for cache invalidation
        INSERT INTO galleries_dirty (gallery_id)
        SELECT DISTINCT id FROM delta
        ON CONFLICT (gallery_id) DO NOTHING;

        -- update distinct nfts
        IF TG_OP = 'INSERT' THEN

            INSERT INTO galleries_distinct_users (user_id)
            SELECT DISTINCT user_id FROM delta
            ON CONFLICT DO NOTHING;

        ELSEIF TG_OP = 'DELETE' THEN

            DELETE FROM galleries_distinct_users
            WHERE user_id IN (SELECT DISTINCT user_id FROM delta);

        END IF;

    END IF;

    RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE TRIGGER on_nft_gallery_insert
    AFTER INSERT ON nft_gallery
    REFERENCING NEW TABLE AS delta
    FOR EACH STATEMENT
EXECUTE PROCEDURE on_gallery_change();

CREATE TRIGGER on_nft_gallery_update
    AFTER UPDATE ON nft_gallery
    REFERENCING NEW TABLE AS delta
    FOR EACH STATEMENT
EXECUTE PROCEDURE on_gallery_change();

CREATE TRIGGER on_nft_gallery_delete
    AFTER DELETE ON nft_gallery
    REFERENCING OLD TABLE AS delta
    FOR EACH STATEMENT
EXECUTE PROCEDURE on_gallery_change();

CREATE TRIGGER on_gallery_insert
    AFTER INSERT ON galleries
    REFERENCING NEW TABLE AS delta
    FOR EACH STATEMENT
EXECUTE PROCEDURE on_gallery_change();

CREATE TRIGGER on_gallery_update
    AFTER UPDATE ON galleries
    REFERENCING NEW TABLE AS delta
    FOR EACH STATEMENT
EXECUTE PROCEDURE on_gallery_change();

CREATE TRIGGER on_gallery_delete
    AFTER DELETE ON galleries
    REFERENCING OLD TABLE AS delta
    FOR EACH STATEMENT
EXECUTE PROCEDURE on_gallery_change();