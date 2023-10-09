<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Support\Builder;
use Staudenmeir\EloquentEagerLimit\HasEagerLimit as BaseHasEagerLimit;

trait HasEagerLimit
{
    use BaseHasEagerLimit;

    protected function newBaseQueryBuilder()
    {
        $connection = $this->getConnection();

        $grammar = $connection->withTablePrefix($this->getQueryGrammar($connection));

        return new Builder(
            $connection,
            $grammar, // @phpstan-ignore-line
            $connection->getPostProcessor()
        );
    }
}
