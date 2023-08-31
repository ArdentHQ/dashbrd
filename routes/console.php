<?php

declare(strict_types=1);

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('schedule:run-now', function (Schedule $schedule) {
    if (app()->isProduction()) {
        $this->error("Can't run this in production, buddy. Sorry.");

        return;
    }

    $app = app();

    $this->withProgressBar($schedule->events(), function ($event) use ($app) {
        $event->run($app);
    });

    $this->newLine(2);

    $this->info('All commands ran.');
})->purpose('Run all scheduled tasks right away');
