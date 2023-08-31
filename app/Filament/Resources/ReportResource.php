<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\ReportResource\Pages\ListReports;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\Report;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static ?string $navigationIcon = 'heroicon-o-flag';

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.wallet')
                            ->weight('medium')
                            ->color('primary')
                            ->label('Reporter')
                            ->default('Unknown')
                            ->formatStateUsing(fn ($state) => $state->details?->domain ?? $state->address ?? 'Unknown')
                            ->url(fn (Report $report) => WalletResource::getUrl('view', ['record' => $report->user->wallet]))
                            ->sortable(),

                TextColumn::make('subject')
                            ->label('What was reported?')
                            ->formatStateUsing(fn ($state) => sprintf('%s #%s', class_basename($state), $state->id))
                            ->url(function (Report $report) {
                                if ($report->subject instanceof Nft) {
                                    return route('collection-nfts.view', [
                                        'collection' => $report->subject->collection,
                                        'nft' => $report->subject,
                                    ]);
                                }

                                if ($report->subject instanceof Collection) {
                                    return route('collections.view', $report->subject);
                                }

                                if ($report->subject instanceof Gallery) {
                                    return route('galleries.view', $report->subject);
                                }
                            })
                            ->openUrlInNewTab()
                            ->weight('medium')
                            ->color('primary')
                            ->icon('heroicon-o-arrow-top-right-on-square')
                            ->iconPosition('after'),

                TextColumn::make('reason')
                            ->label('Reason')
                            ->formatStateUsing(fn (string $state) => Report::reasons()[$state])
                            ->searchable(),

                TextColumn::make('created_at')
                            ->label('Date')
                            ->icon('heroicon-m-calendar')
                            ->dateTime()
                            ->sortable(),

                IconColumn::make('deleted_at')
                            ->default(false)
                            ->label('Resolved')
                            ->boolean()
                            ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                            ->options([
                                'resolved' => 'Resolved',
                                'unresolved' => 'Unresolved',
                            ])->query(function (Builder $query, array $data) {
                                return $query
                                        ->when($data['value'] === 'resolved', fn ($q) => $q->whereNotNull('deleted_at'))
                                        ->when($data['value'] === 'unresolved', fn ($q) => $q->whereNull('deleted_at'));
                            }),

                SelectFilter::make('reason')
                            ->options(Report::reasons())
                            ->query(fn (Builder $query, array $data) => $query->when($data['value'], fn ($q) => $q->where('reason', $data['value']))),
            ])
            ->actions([
                ActionGroup::make([
                    Action::make('unresolve')
                            ->visible(fn (Report $report) => $report->trashed())
                            ->label('Mark as unresolved')
                            ->requiresConfirmation()
                            ->action(fn (Report $report) => $report->restore())
                            ->icon('heroicon-o-x-circle')
                            ->modalHeading('Unresolve report')
                            ->modalDescription('Are you sure you want to mark this report as unresolved?')
                            ->modalSubmitActionLabel('Yes, do it')
                            ->modalIcon('heroicon-o-flag')
                            ->modalWidth('sm'),

                    Action::make('resolve')
                            ->visible(fn (Report $report) => ! $report->trashed())
                            ->label('Mark as resolved')
                            ->requiresConfirmation()
                            ->action(fn (Report $report) => $report->delete())
                            ->icon('heroicon-o-check-circle')
                            ->modalHeading('Resolve report')
                            ->modalDescription('Are you sure you want to mark this report as resolved?')
                            ->modalSubmitActionLabel('Yes, do it')
                            ->modalIcon('heroicon-o-flag')
                            ->modalWidth('sm'),
                ])->iconButton(),
            ])
            ->emptyStateIcon('heroicon-o-flag')
            ->emptyStateHeading('Nothing has been reported yet')
            ->emptyStateDescription("Once any collection, gallery or NFT gets reported, you'll be able to see them here.");
    }

    /**
     * @return Builder<Report>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->withoutGlobalScopes([
            SoftDeletingScope::class,
        ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListReports::route('/'),
        ];
    }

    public static function shouldSkipAuthorization(): bool
    {
        return app()->isLocal();
    }
}
