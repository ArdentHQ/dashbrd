<?php

declare(strict_types=1);

namespace App\Support;

use Staudenmeir\EloquentEagerLimit\Traits\BuildsGroupLimitQueries;
use Tpetry\PostgresqlEnhanced\Query\Builder as BaseBuilder;

class Builder extends BaseBuilder
{
    use BuildsGroupLimitQueries;
}
