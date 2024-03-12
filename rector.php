<?php

declare(strict_types=1);

use Rector\CodeQuality\Rector\BooleanAnd\SimplifyEmptyArrayCheckRector;
use Rector\CodeQuality\Rector\BooleanNot\ReplaceMultipleBooleanNotRector;
use Rector\CodeQuality\Rector\Class_\InlineConstructorDefaultToPropertyRector;
use Rector\CodeQuality\Rector\Identical\GetClassToInstanceOfRector;
use Rector\CodingStyle\Rector\Assign\SplitDoubleAssignRector;
use Rector\CodingStyle\Rector\ClassConst\RemoveFinalFromConstRector;
use Rector\CodingStyle\Rector\ClassConst\SplitGroupedClassConstantsRector;
use Rector\CodingStyle\Rector\ClassMethod\FuncGetArgsToVariadicParamRector;
use Rector\CodingStyle\Rector\ClassMethod\MakeInheritedMethodVisibilitySameAsParentRector;
use Rector\CodingStyle\Rector\ClassMethod\NewlineBeforeNewAssignSetRector;
use Rector\CodingStyle\Rector\Encapsed\WrapEncapsedVariableInCurlyBracesRector;
use Rector\CodingStyle\Rector\FuncCall\CallUserFuncArrayToVariadicRector;
use Rector\CodingStyle\Rector\FuncCall\CallUserFuncToMethodCallRector;
use Rector\CodingStyle\Rector\FuncCall\ConsistentImplodeRector;
use Rector\CodingStyle\Rector\FuncCall\StrictArraySearchRector;
use Rector\CodingStyle\Rector\FuncCall\VersionCompareFuncCallToConstantRector;
use Rector\CodingStyle\Rector\Plus\UseIncrementAssignRector;
use Rector\CodingStyle\Rector\Property\SplitGroupedPropertiesRector;
use Rector\CodingStyle\Rector\Stmt\NewlineAfterStatementRector;
use Rector\CodingStyle\Rector\String_\UseClassKeywordForClassNameResolutionRector;
use Rector\CodingStyle\Rector\Ternary\TernaryConditionVariableAssignmentRector;
use Rector\Config\RectorConfig;
use Rector\EarlyReturn\Rector\If_\RemoveAlwaysElseRector;
use Rector\Php55\Rector\String_\StringClassNameToClassConstantRector;
use Rector\Privatization\Rector\ClassMethod\PrivatizeFinalClassMethodRector;
use Rector\Privatization\Rector\MethodCall\PrivatizeLocalGetterToPropertyRector;
use Rector\Privatization\Rector\Property\PrivatizeFinalClassPropertyRector;
use Rector\TypeDeclaration\Rector\Class_\PropertyTypeFromStrictSetterGetterRector;
use Rector\TypeDeclaration\Rector\Class_\ReturnTypeFromStrictTernaryRector;
use Rector\TypeDeclaration\Rector\ClassMethod\ParamTypeByMethodCallTypeRector;
use Rector\TypeDeclaration\Rector\ClassMethod\ReturnNeverTypeRector;
use Rector\ValueObject\PhpVersion;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->paths([
        __DIR__.'/app',
    ]);

    $rectorConfig->bootstrapFiles([
        __DIR__.'/vendor/larastan/larastan/bootstrap.php',
    ]);

    $rectorConfig->phpVersion(PhpVersion::PHP_82);
    $rectorConfig->importNames();
    $rectorConfig->importShortClasses(false);
    $rectorConfig->phpstanConfig('./phpstan.neon');

    $rectorConfig->rules([
        NewlineAfterStatementRector::class,
        RemoveFinalFromConstRector::class,
        ConsistentImplodeRector::class,
        TernaryConditionVariableAssignmentRector::class,
        StringClassNameToClassConstantRector::class,
        UseIncrementAssignRector::class,
        SplitDoubleAssignRector::class,
        WrapEncapsedVariableInCurlyBracesRector::class,
        NewlineBeforeNewAssignSetRector::class,
        MakeInheritedMethodVisibilitySameAsParentRector::class,
        CallUserFuncArrayToVariadicRector::class,
        VersionCompareFuncCallToConstantRector::class,
        CallUserFuncToMethodCallRector::class,
        FuncGetArgsToVariadicParamRector::class,
        StrictArraySearchRector::class,
        UseClassKeywordForClassNameResolutionRector::class,
        SplitGroupedPropertiesRector::class,
        SplitGroupedClassConstantsRector::class,
        SimplifyEmptyArrayCheckRector::class,
        ReplaceMultipleBooleanNotRector::class,
        GetClassToInstanceOfRector::class,
        PrivatizeLocalGetterToPropertyRector::class,
        InlineConstructorDefaultToPropertyRector::class,
        RemoveAlwaysElseRector::class,
        PrivatizeFinalClassPropertyRector::class,
        PrivatizeFinalClassMethodRector::class,
        ParamTypeByMethodCallTypeRector::class,

        // Types...
        ReturnTypeFromStrictTernaryRector::class,
        PropertyTypeFromStrictSetterGetterRector::class,
        ReturnNeverTypeRector::class,
    ]);
};
