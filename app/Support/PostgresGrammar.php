<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Database\Query\Builder;
use Staudenmeir\EloquentEagerLimit\Grammars\Traits\CompilesPostgresGroupLimit;
use Tpetry\PostgresqlEnhanced\Query\Grammar;

// @codeCoverageIgnore
class PostgresGrammar extends Grammar
{
    use CompilesPostgresGroupLimit;

    /**
     * Compile a select query into SQL.
     *
     * @param Builder $query
     * @return string
     */
    public function compileSelect(Builder $query): string
    {
        if (isset($query->groupLimit)) {
            if (is_null($query->columns)) {
                $query->columns = ['*'];
            }

            return $this->compileGroupLimit($query);
        }

        return parent::compileSelect($query);
    }
}
