<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\Chain;
use App\Models\Collection as NftCollection;
use App\Models\Network;
use App\Models\Token;
use App\Support\Facades\Alchemy;
use App\Support\Facades\Mnemonic;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use stdClass;

class ReformatTopCollectionNfts extends Command
{
    const diskName = 'live-dump';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reformat-top-collection-nfts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reformat top collection NFTs for Alchemy API V3 migration';

    /**
     * @var array<mixed>
     */
    protected array $keyMap = [
        'contract.address' => 'contract.address',
        'contract.name' => 'contractMetadata.name',
        'contract.symbol' => 'contractMetadata.symbol',
        'contract.totalSupply' => 'contractMetadata.totalSupply',
        'contract.deployedBlockNumber' => 'contractMetadata.deployedBlockNumber',
        'contract.openSeaMetadata' => 'contractMetadata.openSea',
        'tokenId' => 'id.tokenId',
        'name' => 'title',
        'description' => 'description',
        'image.thumbnailUrl' => 'media.0.thumbnail',
        'image.cachedUrl' => 'media.0.gateway',
        'image.originalUrl' => 'media.0.raw',
        'raw.metadata' => 'metadata',
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $oldNftsSubDir = 'collection-nfts';
        $newNftsSubDir = 'collection-nfts-v3';

        $fs = Storage::disk(self::diskName);

        foreach ($fs->allDirectories($oldNftsSubDir) as $dir) {
            $contractDirParts = explode('/', $dir);
            $contractDirName = $contractDirParts[1];

            $oldNfts = json_decode($fs->get("{$dir}/nfts.json"), true);

            $newNfts = [];

            foreach ($oldNfts as $nft) {
                $newNft = [];

                foreach ($this->keyMap as $newKey => $oldKey) {
                    Arr::set($newNft, $newKey, Arr::get($nft, $oldKey));
                }

                $newNfts[] = $newNft;

                unset($newDump);
            }

            $fs->put("{$newNftsSubDir}/{$contractDirName}/nfts.json", (string) json_encode($newNfts));
            $fs->copy("{$dir}/traits.json", "{$newNftsSubDir}/{$contractDirName}/traits.json");
        }

        return Command::SUCCESS;
    }
}
