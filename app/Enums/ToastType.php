<?php

declare(strict_types=1);

namespace App\Enums;

enum ToastType: string
{
    case Pending = 'pending';
    case Success = 'success';
    case Warning = 'warning';
    case Error = 'error';
    case Info = 'info';
}
