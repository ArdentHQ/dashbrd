<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneMetaImages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'prune-meta-images';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Removes unused meta images';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $validImages = array_map(fn ($item) => $item->image_name, DB::select(get_query('gallery.get_meta_images')));
        // Convert to associative array so we can use `isset`
        $validImages = array_combine($validImages, $validImages);

        $directory = storage_path(sprintf('meta/galleries/'));

        if (is_dir($directory)) {
            // Open directory
            if ($handle = opendir($directory)) {
                // Loop through each file in the directory
                while (false !== ($file = readdir($handle))) {
                    // Check if file is a PNG and not in validImages
                    if (pathinfo($file, PATHINFO_EXTENSION) === 'png' && ! isset($validImages[$file])) {
                        // Delete the file
                        unlink($directory.$file);
                    }
                }

                // Close directory handle
                closedir($handle);
            }
        }

        return Command::SUCCESS;
    }
}
