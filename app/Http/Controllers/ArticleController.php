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

        if (! $request->get('search')) {
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

        /** @var PaginatedDataCollection<int, ArticleData> $paginated */
        $paginated = ArticleData::collection($articles);

        $response = [
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

        return Inertia::render('Articles/Show', [
            'article' => ArticleData::fromModel($article),
        ])->withViewData([
            'title' => trans('metatags.articles.view.title', ['title' => $article->title]),
            'description' => $article->metaDescription(),
            'image' => $article->getMedia()->first()->getUrl(),
        ]);
    }
}
