<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Chain;
use App\Models\Network;
use Illuminate\Database\Seeder;

class NetworkSeeder extends Seeder
{
    public function run(): void
    {
        $networks = [
            [
                'name' => 'Polygon Mainnet',
                'is_mainnet' => true,
                'chain_id' => Chain::Polygon->value, // 0x89 (hex)
                'public_rpc_provider' => 'https://polygon-rpc.com/',
                'explorer_url' => 'https://polygonscan.com',
            ],
            [
                'name' => 'Mumbai',
                'is_mainnet' => false,
                'chain_id' => Chain::Mumbai->value,
                'public_rpc_provider' => 'https://matic-mumbai.chainstacklabs.com/',
                'explorer_url' => 'https://mumbai.polygonscan.com',
            ],
            [
                'name' => 'Ethereum Mainnet',
                'is_mainnet' => true,
                'chain_id' => Chain::ETH->value,
                'public_rpc_provider' => 'https://cloudflare-eth.com',
                'explorer_url' => 'https://etherscan.io',
            ],
            [
                'name' => 'Goerli',
                'is_mainnet' => false,
                'chain_id' => Chain::Goerli->value,
                'public_rpc_provider' => 'https://goerli.blockpi.network/v1/rpc/public',
                'explorer_url' => 'https://goerli.etherscan.io/',
            ],
        ];

        foreach ($networks as $network) {
            Network::updateOrCreate(['chain_id' => $network['chain_id']], $network);
        }
    }
}
