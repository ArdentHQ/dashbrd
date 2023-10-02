<?php

declare(strict_types=1);

namespace App\Data\Articles;

use App\Enums\ArticleCategoryEnum;
use App\Models\Article;
use DateTime;
use Illuminate\Support\Collection;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class ArticleData extends Data
{
    public function __construct(
        public int $id,
        public string $title,
        public string $slug,
        #[LiteralTypeScriptType('App.Enums.ArticleCategoryEnum')]
        public ArticleCategoryEnum $category,
        public string $content,
        public int $userId,
        public Collection $featuredCollections,
        public ?string $image,
        public ?DateTime $publishedAt,
        public ?string $metaDescription,
    ) {
    }

    public static function fromModel(Article $article): self
    {
        return new self(
            id: $article->id,
            title: $article->title,
            slug: $article->slug,
            category: $article->category,
            content: $article->content,
            userId: $article->user_id,
            featuredCollections: $article->collections->map(fn($collection) => new FeaturedCollectionData(
                $collection->name,
                $collection->collection_image
            )),
            image: $article->getMedia()->first()?->getUrl(),
            publishedAt: $article->published_at,
            metaDescription: $article->metaDescription,
        );
    }
}
