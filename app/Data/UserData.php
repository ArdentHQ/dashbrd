<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\User;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class UserData extends Data
{
    /**
     * @param  Attributes  $attributes
     */
    public function __construct(
        #[LiteralTypeScriptType('Attributes')]
        public Attributes $attributes,
    ) {
    }

    public static function fromModel(User $user): self
    {
        return new self(
            attributes: Attributes::from($user->extra_attributes->toArray()),
        );
    }
}
