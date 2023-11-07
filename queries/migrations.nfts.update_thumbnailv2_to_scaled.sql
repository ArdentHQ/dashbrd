UPDATE nfts
SET extra_attributes =
  jsonb_set(
    jsonb_set(
      jsonb_set(
        extra_attributes::jsonb,
        '{images,thumb}',
        to_jsonb(REGEXP_REPLACE(extra_attributes->'images'->>'thumb', ',h_\d+\/thumbnailv2', '/scaled')),
        true
      ),
      '{images,large}',
      to_jsonb(REGEXP_REPLACE(extra_attributes->'images'->>'large', ',h_\d+\/thumbnailv2', '/scaled/')),
      true
    ),
    '{images,small}',
    to_jsonb(REGEXP_REPLACE(extra_attributes->'images'->>'small', ',h_\d+\/thumbnailv2', '/scaled/')),
    true
  )::json

WHERE
  extra_attributes->'images'->>'thumb' LIKE '%/thumbnailv2/%'
  OR extra_attributes->'images'->>'large' LIKE '%/thumbnailv2/%'
  OR extra_attributes->'images'->>'small' LIKE '%/thumbnailv2/%';
