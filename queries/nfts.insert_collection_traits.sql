insert into collection_traits (
    collection_id, name, value, display_type,
    nfts_count, nfts_percentage,
    created_at, updated_at
) values %s
on conflict (collection_id, name, value) do update
set nfts_count = (case when excluded.nfts_count > 0 then excluded.nfts_count else collection_traits.nfts_count end),
    nfts_percentage = (case when excluded.nfts_percentage > 0 then excluded.nfts_percentage else collection_traits.nfts_percentage end)
returning id, collection_id, name, value