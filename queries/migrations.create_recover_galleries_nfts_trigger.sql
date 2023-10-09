CREATE OR REPLACE FUNCTION recover_nft_gallery_relationship()
RETURNS TRIGGER AS $$
DECLARE
_user_id BIGINT;
BEGIN
  
    WITH recovered_nfts AS (
        SELECT ng.gallery_id, ng.nft_id
        FROM nft_gallery ng
        JOIN nfts n ON ng.nft_id = n.id AND n.id = NEW.id AND n.wallet_id IS NOT NULL
        JOIN galleries g ON g.id = ng.gallery_id
        JOIN wallets w ON g.user_id = w.user_id AND w.id = n.wallet_id
        where ng.deleted_at IS NOT NULL 
    )
    UPDATE nft_gallery
        SET deleted_at = NULL
    FROM recovered_nfts rec
    WHERE nft_gallery.gallery_id = rec.gallery_id AND nft_gallery.nft_id = rec.nft_id;
    
    -- Return NEW to proceed with the update
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call recover_nft_gallery_relationship() after each update on nfts
CREATE TRIGGER recover_nft_gallery_relationship_trigger
AFTER UPDATE OF wallet_id ON nfts
FOR EACH ROW
WHEN (NEW.wallet_id IS NOT NULL AND (OLD.wallet_id IS NULL OR OLD.wallet_id != NEW.wallet_id))
EXECUTE FUNCTION recover_nft_gallery_relationship();
