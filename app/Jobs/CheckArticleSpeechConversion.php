<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Contracts\TextToSpeechProvider;
use App\Enums\TextToSpeechConversionStatus;
use App\Models\Article;
use DateTime;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckArticleSpeechConversion implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Article $article,
        public string $conversionId
    ) {
    }

    /**
     * @throws Exception
     */
    public function handle(TextToSpeechProvider $provider): void
    {
        $status = $provider->status($this->conversionId);

        if ($status === TextToSpeechConversionStatus::Completed) {
            $provider->ensureFileIsPublic($this->article, $this->conversionId);

            $this->article->update([
                'audio_file_url' => $provider->url($this->conversionId),
            ]);

            return;
        }

        if ($status === TextToSpeechConversionStatus::Failed) {
            Log::error('Failed to convert article to audio', [
                'id' => $this->article->id,
            ]);

            throw new Exception('Failed to convert article [ID: '.$this->article->id.'] to speech.');
        }

        $this->release((int) config('dashbrd.text_to_speech.audio_conversion_check_delay_seconds'));
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
