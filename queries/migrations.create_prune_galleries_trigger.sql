
-- Creates a trigger that runs whenever a `nft` is soft deleted or the `wallet_id` changes
-- to cleanup empty galleries.

CREATE OR REPLACE FUNCTION prune_empty_galleries() RETURNS TRIGGER AS $_$
DECLARE
    _user_id BIGINT;
BEGIN
    -- Fetch user id of old wallet
SELECT g.user_id INTO _user_id FROM galleries g
                                        JOIN wallets w ON g.user_id = w.user_id AND w.id = OLD.wallet_id
    LIMIT 1;

-- Mark all gallery nfts as soft deleted if no longer owned by any user
UPDATE nft_gallery
SET deleted_at = NOW()
WHERE nft_gallery.nft_id = NEW.id AND NEW.wallet_id IS NULL;

-- remove gallery nfts relationship if nft belongs to another user or is deleted
WITH removed_nfts AS (
    SELECT gallery_id, nft_id FROM galleries
                                       JOIN nft_gallery ng on galleries.id = ng.gallery_id
                                       JOIN nfts n on ng.nft_id = n.id AND (n.wallet_id != OLD.wallet_id OR n.deleted_at IS NOT NULL)
    WHERE user_id = _user_id
)
DELETE FROM nft_gallery
    USING removed_nfts rm
WHERE nft_gallery.gallery_id = rm.gallery_id AND nft_gallery.nft_id = rm.nft_id;


-- Mark all galleries with all nfts relationship soft deleted as soft deleted
UPDATE galleries
SET deleted_at = NOW()
WHERE id IN (
    SELECT DISTINCT ng.gallery_id
    FROM nft_gallery ng
    WHERE ng.nft_id = NEW.id OR ng.nft_id = OLD.id
)
AND NOT EXISTS (
    SELECT 1
    FROM nft_gallery ng
    WHERE ng.gallery_id = galleries.id AND ng.deleted_at IS NULL
);

-- Lastly, delete all empty galleries of old user
DELETE FROM galleries
WHERE
        user_id = _user_id
  AND
    NOT EXISTS(
        SELECT 1
        FROM nfts
                 INNER JOIN nft_gallery on nfts.id = nft_gallery.nft_id
        WHERE galleries.id = nft_gallery.gallery_id
          AND (nfts.wallet_id IS NOT NULL OR nfts.deleted_at IS NULL)
    );

RETURN NEW;
END;
$_$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prune_empty_galleries_on_nft_change on nfts;
CREATE TRIGGER prune_empty_galleries_on_nft_change
    AFTER UPDATE ON nfts
    FOR EACH ROW WHEN ( (OLD.wallet_id IS NOT NULL AND NEW.wallet_id IS NULL) OR (OLD.wallet_id != NEW.wallet_id) OR (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL))
    EXECUTE PROCEDURE prune_empty_galleries();
