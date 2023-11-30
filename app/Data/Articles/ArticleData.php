<?php

declare(strict_types=1);

namespace App\Data\Articles;

use App\Enums\ArticleCategoryEnum;
use App\Models\Article;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class ArticleData extends Data
{
    /**
     * @param  DataCollection<int, FeaturedCollectionData>  $collections
     */
    public function __construct(
        public int $id,
        public string $title,
        public string $slug,
        #[LiteralTypeScriptType('App.Enums.ArticleCategoryEnum')]
        public ArticleCategoryEnum $category,
        public ?string $audioSrc,
        public string $content,
        /** @var array{ small: string, small2x: string, medium: string, medium2x: string, large: string, large2x: string } */
        #[LiteralTypeScriptType('{ small: string, small2x: string, medium: string, medium2x: string, large: string, large2x: string }')]
        public array $image,
        public int $publishedAt,
        public int $userId,
        public string $authorName,
        /** @var array{ thumb: string | null, thumb2x: string | null } */
        #[LiteralTypeScriptType('{ thumb: string | null, thumb2x: string | null }')]
        public array $authorAvatar,
        #[DataCollectionOf(FeaturedCollectionData::class)]
        public DataCollection $collections,

        public ?string $metaDescription,
    ) {
    }

    public static function fromModel(Article $article): self
    {
        $user = $article->user;

        return new self(
            id: $article->id,
            title: $article->title,
            slug: $article->slug,
            category: $article->category,
            audioSrc: $article->audio_file_url,
            content: $article->content,
            image: [
                'small' => $article->getFirstMediaUrl('cover', 'small'),
                'small2x' => $article->getFirstMediaUrl('cover', 'small@2x'),
                'medium' => $article->getFirstMediaUrl('cover', 'medium'),
                'medium2x' => $article->getFirstMediaUrl('cover', 'medium@2x'),
                'large' => $article->getFirstMediaUrl('cover', 'large'),
                'large2x' => $article->getFirstMediaUrl('cover', 'large@2x'),
            ],
            publishedAt: (int) $article->published_at->timestamp,
            userId: $article->user_id,
            authorName: $user->username ?? 'Unknown',
            authorAvatar: [
                'thumb' => $user->hasMedia('avatar') ? $user->getFirstMediaUrl('avatar', 'thumb') : null,
                'thumb2x' => $user->hasMedia('avatar') ? $user->getFirstMediaUrl('avatar', 'thumb2x') : null,
            ],
            collections: FeaturedCollectionData::collection($article->collections),
            metaDescription: $article->meta_description,
        );
    }
}
