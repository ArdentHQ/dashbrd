<?php

declare(strict_types=1);

namespace App\Enums;

enum Features: string
{
    case Collections = 'collections';
    case Galleries = 'galleries';
    case Portfolio = 'portfolio';
}
