with nft_ids as (
    select distinct on (n.id, c.trait_id) n.id as nft_id, c.trait_id, c.value_string, c.value_numeric, c.value_date
    from unnest(?::bigint[], ?::numeric[], ?::bigint[], ?::text[], ?::numeric[], ?::timestamp[]) c(collection_id, token_number, trait_id, value_string, value_numeric, value_date)
             join nfts n on n.collection_id = c.collection_id and n.token_number = c.token_number
)
insert into nft_trait (nft_id, trait_id, value_string, value_numeric, value_date)
select nft_id, trait_id, value_string, value_numeric, value_date
from nft_ids
on conflict (nft_id, trait_id)
do update set
    value_string = excluded.value_string,
    value_numeric = excluded.value_numeric,
    value_date = excluded.value_date;
