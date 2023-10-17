<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Support\Builder;
use App\Support\PostgresGrammar;
use Illuminate\Database\Connection;
use RuntimeException;
use Staudenmeir\EloquentEagerLimit\Traits\HasEagerLimitRelationships;

trait HasEagerLimit
{
    use HasEagerLimitRelationships;

    /**
     * Get a new query builder instance for the connection.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    protected function newBaseQueryBuilder()
    {
        $connection = $this->getConnection();

        $grammar = $connection->withTablePrefix($this->getQueryGrammar($connection));

        return new Builder(
            $connection,
            $grammar,
            $connection->getPostProcessor()
        );
    }

    /**
     * Get the query grammar.
     *
     * @param \Illuminate\Database\Connection $connection
     * @return \Illuminate\Database\Query\Grammars\Grammar
     */
    protected function getQueryGrammar(Connection $connection)
    {
        $driver = $connection->getDriverName();

        $grammar = match ($driver) {
            'pgsql' => new PostgresGrammar,
            default => throw new RuntimeException('This database is not supported.'), // @codeCoverageIgnore
        };

        // TODO[L11]
        if (method_exists($grammar, 'setConnection')) {
            $grammar->setConnection($connection);
        }

        return $grammar;
    }
}
