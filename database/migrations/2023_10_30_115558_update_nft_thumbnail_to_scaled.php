<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::select("
            UPDATE nfts
            SET extra_attributes =
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    extra_attributes::jsonb,
                    '{images,thumb}',
                    to_jsonb(REGEXP_REPLACE(extra_attributes->'images'->>'thumb', '/thumbnailv2/', '/scaled/')),
                    true
                  ),
                  '{images,large}',
                  to_jsonb(REGEXP_REPLACE(extra_attributes->'images'->>'large', '/thumbnailv2/', '/scaled/')),
                  true
                ),
                '{images,small}',
                to_jsonb(REGEXP_REPLACE(extra_attributes->'images'->>'small', '/thumbnailv2/', '/scaled/')),
                true
              )::json

            WHERE
              extra_attributes->'images'->>'thumb' LIKE '%/thumbnailv2/%'
              OR extra_attributes->'images'->>'large' LIKE '%/thumbnailv2/%'
              OR extra_attributes->'images'->>'small' LIKE '%/thumbnailv2/%'; ");
    }
};
