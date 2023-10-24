<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Contracts\TextToSpeechProvider;
use App\Models\Article;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ConvertArticleToSpeech implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Indicates whether TTS synthesis is temporarily disabled. Primarily used to disable TTS during seeding.
     */
    public static bool $enabled = true;

    public function __construct(
        public Article $article
    ) {
    }

    public static function disable() : void
    {
        static::$enabled = false;
    }

    public static function enable() : void
    {
        static::$enabled = true;
    }

    public function handle(TextToSpeechProvider $provider) : void
    {
        CheckArticleSpeechConversion::dispatch(
            $this->article,
            $provider->convert($this->article)
        )->delay((int) config('app.dashbrd.text_to_speech.audio_conversion_check_delay_seconds'));
    }
}
