<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\ConvertArticleToSpeech;
use App\Models\Article;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

final class GenerateAudioFileForArticle extends Command
{
    protected $signature = 'articles:generate-audio-file
                            {id? : ID of the article}
                            {--from= : ID of the starting article}
                            {--to= : ID of the ending article}
                            {--missing : Only query articles that have never had audio file generated}
   ';

    protected $description = 'Regenerate audio file for the article with the given ID';

    public function handle() : int
    {
        if (! ConvertArticleToSpeech::$enabled || ! (bool) config('dashbrd.text_to_speech.enabled')) {
            $this->warn('Article text-to-speech is currently disabled.');

            return 0;
        }

        $articles = $this->articles()
                    ->isPublished()
                    ->when($this->option('missing'), static fn ($query) => $query->whereNull('audio_file_url'))
                    ->get();

        if ($articles->isEmpty()) {
            $this->warn('No articles found.');

            return 0;
        }

        $articles->each(static function ($article) {
            ConvertArticleToSpeech::dispatch($article);
        });

        $this->info('Regenerating audio files for '.$articles->count().' articles.');

        $chars = $articles->sum(static fn ($article) => strlen($article->content));

        $this->info('Total number of characters sent to AWS: '.number_format($chars).' (could be less because this also includes markdown characters).');

        return 0;
    }

    /**
     * @return Builder<Article>
     */
    private function articles() : Builder
    {
        if ($this->argument('id') !== null) {
            return Article::where('id', $this->argument('id'));
        }

        return Article::query()
                    ->orderBy('id', 'asc')
                    ->limit(500)
                    ->when($this->option('from'), static fn ($query, $from) => $query->where('id', '>=', $from))
                    ->when($this->option('to'), static fn ($query, $to) => $query->where('id', '<=', $to));
    }
}
