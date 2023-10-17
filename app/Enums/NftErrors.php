<?php

declare(strict_types=1);

namespace App\Enums;

enum NftErrors: string
{
    case MetadataOutdated = 'METADATA_OUTDATED';
}
