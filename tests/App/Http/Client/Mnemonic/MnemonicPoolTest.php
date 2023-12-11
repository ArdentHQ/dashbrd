<?php

declare(strict_types=1);

use App\Http\Client\Mnemonic\MnemonicPool;

it('should throw an exception if invalid duration is passed', function () {
    app(MnemonicPool::class)->getNftCollectionVolumeRequest('0x123', 'DURATION_21_DAYS');

})->throws(Exception::class, 'Invalid duration');
