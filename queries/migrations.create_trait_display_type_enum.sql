-- Based on https://docs.mnemonichq.com/references/uniform/rest/reference/#operation/FoundationalService_GetNftAllTraits
--
-- NOTE: simply use `ALTER TYPE trait_type_enum ADD VALUE 'NEW_VALUE'` to add more members once we stop
-- dropping the database on every schema update.
DO
$$
    BEGIN
        CREATE TYPE trait_display_type_enum AS ENUM (
            'DISPLAY_TYPE_PROPERTY', 'DISPLAY_TYPE_LEVEL', 'DISPLAY_TYPE_STAT',
            'DISPLAY_TYPE_BOOST', 'DISPLAY_TYPE_BOOST_PERCENTAGE', 'DISPLAY_TYPE_DATE'
            );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;