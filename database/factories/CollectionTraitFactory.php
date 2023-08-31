<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\TraitDisplayType;
use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CollectionTrait>
 */
class CollectionTraitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $displayType = fake()->randomElement(array_map(fn ($case) => $case, TraitDisplayType::cases()));

        $value = fake()->word();
        $valueMin = null;
        $valueMax = null;
        if ($displayType === TraitDisplayType::Date) {
            $value = fake()->dateTime()->format('Y-m-d H:i:s');
        } elseif ($displayType->isNumeric()) {
            $value = strval(random_int(0, 5000));
            $valueMin = random_int(0, 100);
            $valueMax = $valueMin + random_int(1, 9000);
        }

        return [
            'collection_id' => fn () => Collection::factory(),
            'name' => fn () => fake()->unique()->word(),
            'value' => $value,
            'display_type' => $displayType->value,

            'value_min' => $valueMin,
            'value_max' => $valueMax,

            'nfts_percentage' => fn () => fake()->randomFloat(3, 0, 100.0),
            'nfts_count' => fn () => random_int(0, 10000),
        ];
    }
}
