<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Features;
use App\Enums\TraitDisplayType;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Laravel\Pennant\Feature;

class NftSeeder extends Seeder
{
    public function run(): void
    {
        $wallet = $this->wallet();

        $token = Token::mainnet()->where('symbol', 'eth')->firstOrFail();

        // Create collections
        foreach ($this->collections() as $collectionArray) {
            $collection = Collection::create([
                'address' => $collectionArray['address'],
                'network_id' => Network::where('chain_id', $collectionArray['chain_id'])->first()->id,
                'name' => trim($collectionArray['name']),
                'symbol' => $collectionArray['symbol'] ?? $collectionArray['name'],
                'floor_price' => random_int(1, 20) * 1e18,
                'floor_price_token_id' => $token->id,
                'minted_block' => $collectionArray['minted_block'],
                'minted_at' => $collectionArray['minted_at']->toDateTimeString(),
                'extra_attributes' => json_encode([
                    'image' => $collectionArray['image'],
                    'website' => $collectionArray['website'],
                ]),
                'created_at' => fake()->dateTimeBetween('-2 months'),
                'is_featured' => $collectionArray['is_featured'] ?? false,
                'description' => $collectionArray['description'] ?? '',
            ]);

            if (Feature::active(Features::Collections->value)) {
                // Add traits
                foreach ($collectionArray['traits'] as [$traitName, $traitValue, $displayType, $nftsCount, $nftsPercentage]) {
                    $collection->traits()->create([
                        'name' => $traitName,
                        'value' => $traitValue,
                        'display_type' => $displayType->value,

                        'nfts_count' => $nftsCount,
                        'nfts_percentage' => $nftsPercentage,
                    ]);
                }
            }

            // Add NFTs
            foreach ($collectionArray['nfts'] as [$nftName, $nftTokenNumber, $nftImage]) {
                $nft = $collection->nfts()->create([
                    'wallet_id' => $wallet->id,
                    'token_number' => $nftTokenNumber,
                    'name' => $nftName,
                    'extra_attributes' => json_encode([
                        'images' => [
                            'thumb' => $nftImage,
                            'small' => $nftImage,
                            'large' => $nftImage,
                            'original' => $nftImage,
                            'originalRaw' => $nftImage,
                        ],
                    ]),
                    'created_at' => fake()->dateTimeBetween('-2 months'),
                ]);

                if (Feature::active(Features::Collections->value)) {
                    $collection->traits()->get()->each(function ($trait) use ($nft) {

                        $nft->traits()->attach($trait, [
                            ...CollectionTrait::explodeValueTypeColumns(TraitDisplayType::from($trait['display_type']), $trait['value']),
                        ]);
                    });
                }
            }
        }

        if (Feature::active(Features::Collections->value)) {
            Collection::updateFiatValue();

            User::updateCollectionsValue();
        }
    }

    // Currently we only create 1 full user with NFTs on Ethereum
    private function wallet(): Wallet
    {
        return Wallet::where('address', env('LOCAL_TESTING_ADDRESS'))
            ->firstOrFail();
    }

    private function collections(): array
    {
        // Important: CC0 NFTs, taken from OpenSea as-is
        return [
            [
                // https://opensea.io/collection/proof-moonbirds
                'address' => '0x23581767a106ae21c074b2276D25e5C3e136a68b',
                'name' => 'Moonbirds',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500&auto=format',
                'website' => 'https://www.proof.xyz/moonbirds',
                'minted_block' => 14591056,
                'minted_at' => Carbon::createFromTimestamp(1650040710),
                'nfts' => [
                    ['#8754', 8754, 'https://i.seadn.io/gcs/files/e8431fbe544ce3c528eede272e88bfaa.png?auto=format&dpr=1&w=1000'],
                    ['#1682', 1682, 'https://openseauserdata.com/files/3e0c4fb0b201d66f5ca8e7940873104b.bin'],
                    ['#2677', 2677, 'https://i.seadn.io/gcs/files/a2fcf5854b49102b078f33ab25cc0a68.png?auto=format&dpr=1&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                    ['Background', 'Cosmic Purple', TraitDisplayType::Property, 6, 0.06],
                    ['Beak', 'Small', TraitDisplayType::Property, 4125, 42.15],
                ],
                'is_featured' => true,
                'description' => 'Moonbirds are a collection of 10,000 unique NFTs living on the Ethereum blockchain. Each Moonbird is algorithmically generated and has a unique combination of traits, including body, eyes, beak, wings, and background. Moonbirds are a Proof NFT project.',
            ],
            [
                // https://opensea.io/collection/timelessnfts
                'address' => '0x704bf12276f5c4Bc9349d0e119027eAD839b081b',
                'name' => 'Timeless Characters',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/ufwQp_mUf5PvhgpMMlPueNZcSRBzWqdRTEOq5wSy_I7WEe19bY-i9SY3TRmZO3Nn1Mnl_VxBumFuG42VIsRP7H3o-51Ptz8JNo-e-w?w=500&auto=format',
                'website' => 'https://www.treeverse.net/',
                'minted_block' => 13660419,
                'minted_at' => Carbon::createFromTimestamp(1637528140),
                'nfts' => [
                    ['#2950', 2950, 'https://i.seadn.io/gae/_lm2nWLeWsCzsCr41iqn70KKZOAjvILenf47JJ3mAyhSboa0f39YUzc_6hYfswU0g1qJrMoYDVlaGWjS9iTBPjiYpdqM_U9YYLl6o8o?auto=format&w=1000'],
                    ['#10529', 10529, 'https://i.seadn.io/gae/coxzsEcTbxcX4IPbqGvMabbf_Ir9o2C5I5lcX0SiDPid30qQ7Lr1I0dGvjpQbBUnCWBaxJWKLu0n88TAnqvJLjZ76EgG7snL7U_gGfU?auto=format&w=1000'],
                    ['#4103', 4103, 'https://i.seadn.io/gae/hcePWfW4TVaTGJJfzUhVr8ryviR4Lwg7FIbTNKC_eon5qSmwBF8s6oQT3DWBVKVm5sZi6HKlwoBcT_Hdbg4rovzN28puYcEoRCGCO70?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
            ],
            [
                // https://opensea.io/collection/tubby-cats
                'address' => '0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD',
                'name' => 'tubby cats',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/TyPJi06xkDXOWeK4wYBCIskRcSJpmtVfVcJbuxNXDVsC39IC_Ls5taMlxpZPYMoUtlPH7YkQ4my1nwUGDIB5C01r97TPlYhkolk-TA?w=500&auto=format',
                'website' => 'https://tubbycats.xyz/home',
                'minted_block' => 14250576,
                'minted_at' => Carbon::createFromTimestamp(1645461953),
                'nfts' => [
                    ['11339', 7015, 'https://i.seadn.io/gcs/files/258e31b62e78796cd9283aa43ba02b8f.png?auto=format&dpr=1&w=1000'],
                    ['15257', 10657, 'https://i.seadn.io/gcs/files/1ad0cf4adb0e5b3abf41158b0ef342d3.png?auto=format&dpr=1&w=1000'],
                    ['11069', 4857, 'https://i.seadn.io/gcs/files/a1fa26a7df84a34f882cf2297f9691d5.png?auto=format&dpr=1&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
                'is_featured' => true,
                'description' => 'Tubby Cats are a collection of 10,000 unique NFTs living on the Ethereum blockchain. Each Tubby Cat is algorithmically generated and has a unique combination of traits, including body, eyes, mouth, and background. Tubby Cats are a Proof NFT project.',
            ],
            [
                // https://opensea.io/collection/alphadogs
                'address' => '0x32f8EE2B5707138e1bdd04D3631A04EB104dc141',
                'name' => 'AlphaDogs',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gcs/files/4ef4a60496c335d66eba069423c0af90.png?w=500&auto=format',
                'website' => 'https://alphadogsnft.io/',
                'minted_block' => 15047648,
                'minted_at' => Carbon::createFromTimestamp(1656548114),
                'nfts' => [
                    ['Puppy #0x02040e160b0200', 72625002537222656, 'https://i.seadn.io/gcs/files/25e59eef2e42b666b3f306119c08d4d7.gif?auto=format&w=1000'],
                    ['Puppy #0x10090426120800', 76571107088533504, 'https://i.seadn.io/gcs/files/3c5e4ef85aed2cf76dbfd9dc767927cb.gif?auto=format&w=1000'],
                    ['Puppy #0x1403010c120800', 77690396604499968, 'https://i.seadn.io/gcs/files/f50c1a295159aac3686cbf1ff357de50.gif?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
                'is_featured' => true,
            ],
            [
                // https://opensea.io/collection/devilvalley
                'address' => '0xC70C411cFDbE542e8208AF52092CA4f56B633977',
                'name' => 'devilvalley',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gcs/files/2c14dac66def18423ac5f14f26c15611.jpg?w=500&auto=format',
                'website' => 'https://badfroot.com/',
                'minted_block' => 14981281,
                'minted_at' => Carbon::createFromTimestamp(1655499623),
                'nfts' => [
                    ['devilvalley #955', 955, 'https://i.seadn.io/gae/PgT4j310cheY4Ess5ow1n9zaEWaytp2EGlm3cSQkuTxiR_itydh_jS5pYOyUpgO4eji5MVCB6N3rnsLEZnep5tWxaRr7TEO0_siC?auto=format&w=1000'],
                    ['devilvalley #4949', 4949, 'https://i.seadn.io/gae/fCB5Jp5lEkOXMHdvxXfhJ5P8pAZW9KP34ma2hNssHRsqJA4avqXi8KnDi6Yhj5r3YE-mJS-ttIih6V5CyU2MNHBqJGcAxdhbsKWUHg?auto=format&w=1000'],
                    ['devilvalley #3738', 3738, 'https://i.seadn.io/gae/Lk-IC9RMx7BL17t3u4xL-jAFeYIVgTOpUvDiqkF3JGWdf8SVsYaE8KdI3twI5meKmHkDzU30nrTfO6sEPByXhOksOUtkbrEtap9i2A?auto=format&w=1000'],
                ],
                'traits' => [],
            ],
            [
                // https://opensea.io/collection/edgehogs
                'address' => '0x96889c4766e3d548F6842A6b3bB0B69D1b707b8C',
                'name' => 'EDGEHOGS',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/7Tdp77e_70pMmVZ41s9F9PQIu7hsA5ewJ7i0sgMvhMtNx6-M3uQmgM4ZZW2pnW5G-BDG8Db1iqWbh9E5_jmYHNa3U0NgtwCd2NUQ7qs?w=500&auto=format',
                'website' => 'https://www.edgehogs.io/',
                'minted_block' => 14679474,
                'minted_at' => Carbon::createFromTimestamp(1651239183),
                'nfts' => [
                    ['Edgehog #6124', 6124, 'https://openseauserdata.com/files/ccc94d30e0e4592e8982089c29b0f357.svg'],
                    ['Edgehog #205', 205, 'https://openseauserdata.com/files/ed55c1aa9c626351d7606bfa9289d2ec.svg'],
                    ['Edgehog #3837', 3837, 'https://openseauserdata.com/files/e98f3b298343e59842544a804ec5b82c.svg'],
                ],
                'traits' => [
                    ['Beak', 'Small', TraitDisplayType::Property, 4125, 42.15],
                ],
                'is_featured' => true,
                'description' => 'EDGEHOGS are a collection of 10,000 unique NFTs living on the Ethereum blockchain. Each EDGEHOG is algorithmically generated and has a unique combination of traits, including body, eyes, beak, wings, and background. EDGEHOGS are a Proof NFT project.',
            ],
            [
                // https://opensea.io/collection/cryptoadz-by-gremplin
                'address' => '0x1CB1A5e65610AEFF2551A50f76a87a7d3fB649C6',
                'name' => 'CrypToadz by GREMPLIN',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/iofetZEyiEIGcNyJKpbOafb_efJyeo7QOYnTog8qcQJhqoBU-Vu9l3lXidZhXOAdu6dj4fzWW6BZDU5vLseC-K03rMMu-_j2LvwcbHo?w=500&auto=format',
                'website' => 'https://www.cryptoadz.io/',
                'minted_block' => 13186834,
                'minted_at' => Carbon::createFromTimestamp(1631126543),
                'nfts' => [
                    ['CrypToadz #3114', 3114, 'https://i.seadn.io/gae/_2fZ1jrxFxCEOojPBDfjfgwcaWPlOGgtJd4cs0TUMHrJu7sSnu0N6gkgetqbQbyIXDI7o4ddjQCskd6tYU_oSfo8HeQIWIOPVXHQRg?auto=format&w=1000'],
                    ['CrypToadz #3859', 3859, 'https://i.seadn.io/gae/pGPepXy4c5YRdu0Tl_CVBELcQlJj8yXw_3eSF2ok3Zn9Ld8lFrS6lp6CXZ4x1xfWF417DB8gscswlEaiKq5dHf2AdyiY5v8Fatll?auto=format&w=1000'],
                    ['CrypToadz #2531', 2531, 'https://i.seadn.io/gae/UpDI6wrGTeSXluy1i91w5IoPCGTnv-cMRDOIuhJGO_eZb22vuhdith5wfjI9AY1OCg1sR0NEkKCSlFAqC9vLk31H7pjessSQ_vmuyg?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
            ],
            [
                // https://opensea.io/collection/cryptodickbutts-s3
                'address' => '0x42069abfe407c60cf4ae4112bedead391dba1cdb',
                'name' => 'CryptoDickbutts',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/vw-gp8yUYkQsxQN5xbHrWEhY7rQWQZhIjgO2tvLxu46VY6iwulwWZt5VFS2Q9gy9qJaiJk8QspZs0qaM9z1ODeIyeUUseABOxdfVrC8?auto=format&w=500',
                'website' => 'https://cryptodickbutts.com/',
                'minted_block' => 12915110,
                'minted_at' => Carbon::createFromTimestamp(1627484750),
                'nfts' => [
                    ['CryptoDickbutt #2293', 2293, 'https://i.seadn.io/gcs/files/3fa8e4651f6d04eed36fdaa9acb2ba47.png?auto=format&w=1000'],
                    ['CryptoDickbutt #3117', 3117, 'https://i.seadn.io/gcs/files/cbee414807a03999445f7ae11a9cf092.png?auto=format&w=1000'],
                    ['CryptoDickbutt #2531', 2531, 'https://i.seadn.io/gcs/files/74e5f1e7d2ae40e943439e43eba12fa3.png?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
            ],
            [
                // https://opensea.io/collection/tiny-dinos-eth
                'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                'name' => 'tiny dinos (eth)',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/ZoC0EZPOaQeMGdAmqXh-PbOqEdrINf37NnD7wxI8FRa0Ymt8corMCzOP0xMPXjx2P12cvB6pDLWWnPSFJ1cOwbjqZc2_c3haN3n_8A?auto=format&w=256',
                'website' => 'https://tinydinos.fun/',
                'minted_block' => 14528450,
                'minted_at' => Carbon::createFromTimestamp(1649195419),
                'nfts' => [
                    ['tiny dinos #2691', 2691, 'https://i.seadn.io/gae/Iv9tX-24fzc_gHH8sxQldCfqufz36z8mMpb0ddxtvhZWIxHXitJZ1_EfLOawZGzk_VKoaw65-j6dC1lZrb00_p7tD-sO3y5VaER_rg?auto=format&w=1000'],
                    ['tiny dinos #671', 671, 'https://i.seadn.io/gae/D0gNciOfeBSZnY7_9UUEuibRO-Qa3Z2JPcPOvWswpNwqbYHTuNGDU829coKwdzOcjx0l2wi7060hxGUmcaX2-bwTJXzA-oeGlZZT?auto=format&w=1000'],
                    ['tiny dinos #581', 581, 'https://i.seadn.io/gae/-vHk-pTQqrXsPjTgtle2LRLzNygrCtA_ic_6Lx7M6zg87BvGXLzTDaxDD_oxfAYzGBCOM0KOyRI4f5daVwIjDiYfY5WKd_U3BFufiQ?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
            ],
            [
                // https://opensea.io/collection/goblintownwtf
                'address' => '0xbce3781ae7ca1a5e050bd9c4c77369867ebc307e',
                'name' => 'goblintown.wtf',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/cb_wdEAmvry_noTfeuQzhqKpghhZWQ_sEhuGS9swM03UM8QMEVJrndu0ZRdLFgGVqEPeCUzOHGTUllxug9U3xdvt0bES6VFdkRCKPqg?auto=format&w=256',
                'website' => 'https://goblintown.wtf/',
                'minted_block' => 14805909,
                'minted_at' => Carbon::createFromTimestamp(1652976980),
                'nfts' => [
                    ['goblintown #736', 736, 'https://i.seadn.io/gcs/files/aa32413f16df306f32ee778bad17afe4.png?auto=format&w=1000'],
                    ['goblintown #6987', 6987, 'https://i.seadn.io/gcs/files/9cf828b8cb0196c578a0940e9dbe0e1f.png?auto=format&w=1000'],
                    ['goblintown #889', 889, 'https://i.seadn.io/gcs/files/af52e099efb9c1a5ba1c08196d7cf695.png?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
            ],
            [
                // https://opensea.io/collection/mfers
                'address' => '0x79fcdef22feed20eddacbb2587640e45491b757f',
                'name' => 'mfers',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/J2iIgy5_gmA8IS6sXGKGZeFVZwhldQylk7w7fLepTE9S7ICPCn_dlo8kypX8Ju0N6wvLVOKsbP_7bNGd8cpKmWhFQmqMXOC8q2sOdqw?auto=format&w=256',
                'website' => null,
                'minted_block' => 13711155,
                'minted_at' => Carbon::createFromTimestamp(1638224446),
                'nfts' => [
                    ['mfer #2865', 2865, 'https://i.seadn.io/gcs/files/a38146b17794987425dbaf27b4e345e7.png?auto=format&w=1000'],
                    ['mfer #3225', 3225, 'https://i.seadn.io/gcs/files/b751649e14ef7741065170e8326cca64.png?auto=format&w=1000'],
                    ['mfer #4344', 4344, 'https://i.seadn.io/gcs/files/fea86d4a2bb5fb48f8f2f6d2dbfd87d8.png?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Body', 'Golden', TraitDisplayType::Property, 25, 0.25],
                ],
            ],
            [
                // https://opensea.io/collection/nouns
                'address' => '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03',
                'name' => 'Nouns',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/vfYB4RarIqixy2-wyfP4lIdK6fsOT8uNrmKxvYCJdjdRwAMj2ZjC2zTSxL-YKky0s-4Pb6eML7ze3Ouj54HrpUlfSWx52xF_ZK2TYw?auto=format&w=256',
                'website' => 'https://nouns.wtf/',
                'minted_block' => 12985438,
                'minted_at' => Carbon::createFromTimestamp(1628438543),
                'nfts' => [
                    ['Noun 164', 164, 'https://openseauserdata.com/files/dc4ae6df7babfa66dbdb563cb4ce0073.svg'],
                    ['Noun 105', 105, 'https://openseauserdata.com/files/c7b325d3526a680733c4ebd97405687b.svg'],
                    ['Noun 115', 115, 'https://openseauserdata.com/files/611d1af23df5d3b160f4c433c4647c43.svg'],
                ],
                'traits' => [
                    ['Body', 'Brown', TraitDisplayType::Property, 25, 0.25],
                ],
            ],
            [
                // https://opensea.io/collection/rektguy
                'address' => '0xb852c6b5892256c264cc2c888ea462189154d8d7',
                'name' => 'rektguy',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gcs/files/0d5f1b200a067938f507cbe12bbbabc2.jpg?auto=format&w=256',
                'website' => 'https://rektguy.com/',
                'minted_block' => 14813542,
                'minted_at' => Carbon::createFromTimestamp(1653083906),
                'nfts' => [
                    ['rektguy #8509', 8509, 'https://i.seadn.io/gcs/files/173709f2659d38994acef13bbd2892b7.gif?auto=format&w=1000'],
                    ['rektguy #5174', 5174, 'https://i.seadn.io/gae/PBvrSuAE3VXMJg5UPUYW7OZit3TiWHTZgZ8nOFhTjDpeHE5eiXGRRf__5fOPF9JUdbCWoqWI2vOOHO8WpfrFKUSbk0BQSO7TijOY?auto=format&w=1000'],
                    ['rektguy #5150', 5150, 'https://i.seadn.io/gae/vU38seTlfQV5CrNiIup39Mjf4zATupmny2mbbcYiwMD1c8Erq9ZKFKyDobDndJMM92fRrMcXzp3ntIRvzgZI-stfBk_Ip1DetOMK?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                    ['Body', 'Brown', TraitDisplayType::Property, 25, 0.25],
                ],
            ],
            [
                // https://opensea.io/collection/chain-runners-nft
                'address' => '0x97597002980134bea46250aa0510c9b90d87a587',
                'name' => 'Chain Runners',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/3vScLGUcTB7yhItRYXuAFcPGFNJ3kgO0mXeUSUfEMBjGkGPKz__smtXyUlRxzZjr1Y5x8hz1QXoBQSEb8wm4oBByeQC_8WOCaDON4Go?auto=format&w=256',
                'website' => 'http://chainrunners.xyz/',
                'minted_block' => 13556221,
                'minted_at' => Carbon::createFromTimestamp(1636110384),
                'nfts' => [
                    ['Runner #6568', 6568, 'https://i.seadn.io/gae/lWRB5D7UPD-wiPy3UqZh0Js17cv-PQ6Df-oQfzFX28-BE9gV3HNV-wuT6kYpwn2-VdfZBf_9hNz45wHpRvI0fR3_rcaTwNs_AuVt?auto=format&w=1000'],
                    ['Runner #2029', 2029, 'https://i.seadn.io/gae/khoMVzFigNcjuv6wHvhlr_aHB_wnIWrk6NFG89FFcXVes39Wopz4qLqoHhPaekmaX5V5qGmD1qKd1ELuK8Vexox3qusezrxJPMLagg?auto=format&w=1000'],
                    ['Runner #6936', 6936, 'https://i.seadn.io/gae/qnKGuihB4C-U3yWjDkSDgnnBZ9TsmXll2i7Mmr2TRKxgWkWfToIMAaOin5mieGALZovBs7_miFDR0qGFS5bHpfMKwiCnR-EJAasEG4Y?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                    ['Body', 'Brown', TraitDisplayType::Property, 25, 0.25],
                ],
            ],
            [
                // https://opensea.io/collection/larva-lads
                'address' => '0x5755ab845ddeab27e1cfce00cd629b2e135acc3d',
                'name' => 'Larva Lads',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gcs/files/b76e0a2dfc2980ad9d12b103631128f7.png?auto=format&w=256',
                'website' => 'http://larvalads.com/',
                'minted_block' => 13846402,
                'minted_at' => Carbon::createFromTimestamp(1640060947),
                'nfts' => [
                    ['Larva Lad #1800', 1800, 'https://openseauserdata.com/files/b1ea20ed442d6a79ac925bcf091c0420.svg'],
                    ['Larva Lad #2101', 2101, 'https://openseauserdata.com/files/a5cd17744b0ac1cff4d062e047e3feb8.svg'],
                    ['Larva Lad #4431', 4431, 'https://openseauserdata.com/files/d96af1fd4a8ef60daa90267dc3d8273d.svg'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                    ['Body', 'Brown', TraitDisplayType::Property, 25, 0.25],
                ],
            ],
            [
                // https://opensea.io/collection/blitmap
                'address' => '0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63',
                'name' => 'Blitmap',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/N61iOqLx-qWAjIqVet9L0Fx-tWrgr_Jn6hdlyke23nnRdkRqDeE8Htz_BVjlOJ7KxEfB3KyujldKWnQg0bDao-Y1zyEJnogKtvaf?auto=format&w=256',
                'website' => 'http://blitmap.com/',
                'minted_block' => 12439123,
                'minted_at' => Carbon::createFromTimestamp(1621083761),
                'nfts' => [
                    ['#909 - Looney Rose', 909, 'https://i.seadn.io/gcs/files/a76c3727059cdffa14fc7933a997e39c.png?auto=format&w=1000'],
                    ['#1001 - Otoro Genesis', 1001, 'https://i.seadn.io/gcs/files/dc838f9f1aa3776c0186efd2e0dac3b2.png?auto=format&w=1000'],
                    ['#1009 - Overloaded Mageglovey', 1009, 'https://i.seadn.io/gcs/files/1184368130e357cd87c741d3c5e29edc.png?auto=format&w=1000'],
                ],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                ],
            ],

            [
                // https://opensea.io/collection/ens
                'address' => '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
                'name' => 'Ethereum Name Service',
                'symbol' => 'ENS',
                'chain_id' => 1,
                'image' => 'https://i.seadn.io/gae/0cOqWoYA7xL9CkUjGlxsjreSYBdrUBE0c6EO1COG4XE8UeP-Z30ckqUNiL872zHQHQU5MUNMNhfDpyXIP17hRSC5HQ?auto=format&w=256',
                'website' => 'https://ens.domains/',
                'minted_block' => 9380410,
                'minted_at' => Carbon::createFromTimestamp(1580345034),
                'nfts' => [],
                'traits' => [
                    ['Background', 'Blue', TraitDisplayType::Property, 1636, 16.36],
                    ['Strength', '1', TraitDisplayType::Stat, 1636, 16.36],
                ],
            ],
        ];
    }
}
