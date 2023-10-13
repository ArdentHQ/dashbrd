<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Articles\ArticleData;
use App\Data\Articles\ArticlesData;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelData\PaginatedDataCollection;

class ArticleController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $pageLimit = min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 10, 96);

        $articles = Article::query()
            ->search($request->get('search'))
            ->when($request->get('sort') !== 'popularity', fn ($q) => $q->sortById())
            ->with(['collections' => function ($query) {
                $query->select(['collections.name', 'collections.extra_attributes->image as image']);
            }])
            ->paginate($pageLimit);

        /** @var PaginatedDataCollection<int, ArticleData> $paginated */
        $paginated = ArticleData::collection($articles);

        if ($request->wantsJson()) {
            return response()->json([
                'articles' => new ArticlesData($paginated),
            ]);
        }

        return Inertia::render('Articles/Index', [
            'allowsGuests' => true,
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

        return Inertia::render('Articles/Show', [
            'allowsGuests' => true,
            'article' => ArticleData::fromModel($article),
        ])->withViewData([
            'title' => trans('metatags.articles.view.title', ['title' => $article->title]),
            'description' => $article->metaDescription(),
            'image' => $article->getFirstMediaUrl('cover', 'meta'),
        ]);
    }
}
