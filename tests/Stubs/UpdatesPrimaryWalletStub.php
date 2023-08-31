<?php

declare(strict_types=1);

namespace Tests\Stubs;

use App\Http\Requests\Traits\UpdatesPrimaryWallet;
use App\Models\User;

class UpdatesPrimaryWalletStub
{
    use UpdatesPrimaryWallet;

    public function __construct(public string $address, public int $chainId, public User $user)
    {
    }

    public function user(): User
    {
        return $this->user;
    }
}
