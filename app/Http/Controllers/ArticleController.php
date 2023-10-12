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
        $pageLimit = min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 10, 96);

        $highlightedArticles = collect();

        $currentPage = (int)$request->get('page') ?? 1;

        if (! $request->get('search') && $currentPage === 1) {
            $highlightedArticles = Article::query()
                ->sortByPublishedDate()
                ->withFeaturedCollections()
                ->limit(3)
                ->get();
        }

        /** @var LengthAwarePaginator<Article> $articles */
        $articles = Article::query()
            ->search($request->get('search'))
            ->when($request->get('sort') !== 'popularity', fn ($q) => $q->sortById())
            ->when($request->get('sort') === 'popularity', fn ($q) => $q->sortByPopularity())
            ->whereNotIn('articles.id', $highlightedArticles->pluck('id'))
            ->withFeaturedCollections()
            ->paginate($pageLimit);

        $articles = new LengthAwarePaginator(
            items: $highlightedArticles->concat($articles->items()),
            total: $articles->total(),
            perPage: $articles->perPage(),
            currentPage: $articles->currentPage(),
        );

        /** @var PaginatedDataCollection<int, ArticleData> $paginated */
        $paginated = ArticleData::collection($articles);

        if ($request->wantsJson()) {
            return response()->json([
                'articles' => new ArticlesData($paginated),
            ]);
        }

        return Inertia::render('Articles/Index', [
            'articles' => new ArticlesData($paginated),
        ])->withViewData([
            'title' => trans('metatags.articles.title'),
        ]);
    }

    public function show(Article $article): Response
    {
        if ($article->isNotPublished()) {
            abort(404);
        }

        views($article)->record();

        return Inertia::render('Articles/Show', [
            'article' => ArticleData::fromModel($article),
        ])->withViewData([
            'title' => trans('metatags.articles.view.title', ['title' => $article->title]),
            'description' => $article->metaDescription(),
            'image' => $article->getMedia()->first()->getUrl(),
        ]);
    }
}
