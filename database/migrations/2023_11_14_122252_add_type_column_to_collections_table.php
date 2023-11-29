<?php

declare(strict_types=1);

use App\Enums\TokenType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->string('type')->default(TokenType::Erc721->value);
        });

        DB::table('collections')->update([
            'type' => TokenType::Erc721->value,
        ]);

        $eth = $this->erc1155Addresses('eth');
        $polygon = $this->erc1155Addresses('polygon');

        DB::table('collections')->where(function ($q) use ($polygon) {
            return $q->whereIn('address', $polygon)->where('network_id', 1);
        })->orWhere(function ($q) use ($eth) {
            return $q->whereIn('address', $eth)->where('network_id', 3);
        })->update([
            'type' => TokenType::Erc1155,
        ]);
    }

    /**
     * @return Collection<int, string>
     */
    private function erc1155Addresses(string $network): Collection
    {
        $path = database_path('seeders/fixtures/live-dump/collection-nfts/top-'.$network.'-collections.json');

        // It's possible this file does not exist in situations like GitHub Actions, so we hardcode the list of addresses taken from the file...
        if (! file_exists($path)) {
            return $network === 'eth' ? collect([
                "0x495f947276749ce646f68ac8c248420045cb7b5e",
                "0x76be3b62873462d2142405439777e971754e8e77",
                "0x910152fca5149a50967cc3f0816d269287681ef2",
                "0x7881c3a8d4a8d8a5d6b648164de823142d8aaf5d",
                "0x22c36bfdcef207f9c0cc941936eff94d4246d14a",
                "0x86825dfca7a6224cfbd2da48e85df2fc3aa7c4b1",
                "0xc36cf0cfcb5d905b8b513860db0cfe63f6cf9f5c",
                "0x341a1c534248966c4b6afad165b98daed4b964ef",
                "0x28472a58a490c5e09a238847f66a68a47cc76f0f",
                "0x4ba0be4d8d83b5ca9935d0e0284f707e8f2dd6d1",
                "0x73da73ef3a6982109c4d5bdb0db9dd3e3783f313",
                "0x348fc118bcc65a92dc033a951af153d14d945312",
                "0x4a33f4f14989f5841a0807166bc43a7a7ec17c0c",
            ]) : collect([
                "0x2953399124f0cbb46d2cbacd8a89cf0599974963",
                "0x86935f11c86623dec8a25696e1c19a8659cbf95d",
                "0x7888d293cd4544d7bc8e4ad5773b7d7083f594fe",
                "0xcf1a0fe9781e4afa07ee0dabd6762c7bb73d7c27",
                "0x99a558bdbde247c2b2716f0d4cfb0e246dfb697d",
                "0xa4f709db1f2b5f78d5f44ea5f30e430193b532c3",
                "0x45df11da3e03a3bcd55c36576b72c5c6956c151b",
                "0xdf2d71c81d37b2165330c0ff80ff2e469501ef00",
                "0x7703ee03046d15ea22c8afa72696885307eba1c4",
                "0x13c7a9b6eca5a9c7a134dd918d73bbf3e7da70f8",
                "0x95fcb7f46f1e652fdf23db087c0f24011775be00",
                "0x3cb5379eee24533cd50292e912829722e7894a00",
                "0xa5511e9941e303101b50675926fd4d9c1a8a8805",
                "0xba6666b118f8303f990f3519df07e160227cce87",
                "0x104ed06d70bde4106c7b61897af8f7c70763686e",
                "0x96b5d0b04bdbf1cf60a2e2c7971323229c6f4638",
                "0x22d5f9b75c524fec1d6619787e582644cd4d7422",
                "0xb6041eae62c4591458af480679c6a497eda6cfcd",
                "0x4e874c0a1196951c075ea2fe54fa7196bc117cee",
                "0x0a82c7f7efe5526514448957ac5c05ab16ade5db",
                "0x11c0d2ddfa514dce9dc4a8a7d8ae0eed2567641d",
                "0xcf35c6b949fbd9b9fd182a3e4fd1aa0fddf53fc7",
                "0x91ac106090fe2b0fa7d01efdf4487a5bfafad7fa",
                "0x71529389174fdb537f33fe7b51a7dd434d7ee336",
                "0xba3c9879fca47015558065adb44cad5e9fe3e119",
                "0x3104820ca8c6fbad85f4229f069c5006431a82ae",
                "0x8d0501d85becda92b89e56177ddfcea5fc1f0af2",
                "0x5d1d281e2fe022b8b0f8f800fda75ec8c9b5415b",
                "0xb9023662dc421e304976a778b0207b95b1d8cd25",
                "0xb7c1facd24ab39e5a79a91f719f99d6494529a4c",
                "0xc6f3bb843e34e0b4d1fb5109f348956460973114",
                "0xcbc964dd716f07b4965b4526e30541a66f414ccf",
                "0x6665b76657399c29480eeaa6c909a56db6062dd4",
                "0x907808732079863886443057c65827a0f1c64357",
                "0x5c76677fea2bf5dd37e4f1460968a23a537e3ee3",
                "0x3e4627665bf2e52c69be03788e664ab545f2be71",
                "0xe05b72d3b70be3c4e0b8461015198919e2b676fd",
                "0x7c885c4bfd179fb59f1056fbea319d579a278075",
                "0xadf46f34fbd7489603158555cf45bde696fd65e3",
                "0x56b917d7fed613fa867d58454e591753f1de8fc6",
                "0x6faa88e0c6bd11c50d5163f47f78c1c8146b7a27",
            ]);
        }

        $contents = file_get_contents($path);

        return collect(json_decode($contents, true)['data'])
                ->filter(fn ($collection) => $collection['erc_type'] === 'erc1155')
                ->pluck('contract_address');
    }
};
