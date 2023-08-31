<?php

declare(strict_types=1);

namespace Database\Factories\Traits;

use Illuminate\Database\Eloquent\Factories\Factory;

trait RandomTimestamps
{
    public function withRandomCreationDate(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'created_at' => fake()->dateTimeBetween('-2 month'),
            ];
        });
    }
}
