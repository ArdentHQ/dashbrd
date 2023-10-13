<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Article;
use App\Support\Queues;
use Illuminate\Console\Command;

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
        })->onQueue(Queues::SCHEDULED_DEFAULT);

        return Command::SUCCESS;
    }
}
