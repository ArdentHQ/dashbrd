<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Article;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class UpdateArticlesViewCount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:update-view-count';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates view count of the articles';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        dispatch(static function () {
            Article::updateViewCounts();

            // Flush the cached articles used on the "Collections" page...
            Cache::forget('articles:latest');
            Cache::forget('articles:popular');
        })->onQueue(Queues::SCHEDULED_DEFAULT);

        return Command::SUCCESS;
    }
}
