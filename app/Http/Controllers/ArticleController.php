<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Articles\ArticleData;
use App\Data\Articles\ArticlesData;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelData\PaginatedDataCollection;

class ArticleController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $pageLimit = min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 24, 96);

        $highlightedArticles = collect();

        if (! $request->get('search')) {
            $highlightedArticles = Article::query()
                ->isPublished()
                ->sortByPublishedDate()
                ->with('media', 'user.media')
                ->withFeaturedCollections()
                ->limit(3)
                ->get();
        }

        /** @var LengthAwarePaginator<Article> $articles */
        $articles = Article::query()
            ->isPublished()
            ->search($request->get('search'))
            ->with('media', 'user.media')
            ->when($request->get('sort') !== 'popularity', fn ($q) => $q->sortById())
            ->when($request->get('sort') === 'popularity', fn ($q) => $q->sortByPopularity())
            ->whereNotIn('articles.id', $highlightedArticles->pluck('id'))
            ->withFeaturedCollections()
            ->paginate($pageLimit)
            ->withQueryString();

        /** @var PaginatedDataCollection<int, ArticleData> $paginated */
        $paginated = ArticleData::collection($articles);

        $response = [
            'allowsGuests' => true,
            'articles' => new ArticlesData($paginated),
            'highlightedArticles' => ArticleData::collection($highlightedArticles),
        ];

        if ($request->wantsJson()) {
            return response()->json($response);
        }

        return Inertia::render('Articles/Index', $response)->withViewData([
            'title' => trans('metatags.articles.title'),
        ]);
    }

    public function show(Article $article): Response
    {
        if ($article->isNotPublished()) {
            abort(404);
        }

        views($article)->record();

        $popularArticles = ArticleData::collection(
            Article::sortByPopularity()
                ->isPublished()
                ->withFeaturedCollections()
                ->where('id', '!=', $article->id)
                ->limit(4)
                ->get()
        );

        return Inertia::render('Articles/Show', [
            'allowsGuests' => true,
            'article' => ArticleData::fromModel($article),
            'popularArticles' => $popularArticles,
        ])->withViewData([
            'title' => trans('metatags.articles.view.title', ['title' => $article->title]),
            'description' => $article->metaDescription(),
            'image' => $article->getFirstMediaUrl('cover', 'meta'),
        ]);
    }
}
