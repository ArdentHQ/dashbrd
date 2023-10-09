CREATE OR REPLACE FUNCTION recover_gallery()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the gallery associated with the updated NFT is soft-deleted
    IF EXISTS (
        SELECT 1
        FROM galleries
        WHERE galleries.id = NEW.gallery_id
        AND galleries.deleted_at IS NOT NULL
    ) THEN
        -- If so, undelete the gallery
        UPDATE galleries
        SET deleted_at = NULL
        WHERE id = NEW.gallery_id;
    END IF;
    -- Return NEW to proceed with the update
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to call recover_gallery() after each update on nft_gallery
CREATE TRIGGER recover_gallery_trigger
AFTER UPDATE ON nft_gallery
FOR EACH ROW
WHEN (NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL)
EXECUTE FUNCTION recover_gallery();
