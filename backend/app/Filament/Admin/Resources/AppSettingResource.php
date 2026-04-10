<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\AppSettingResource\Pages;
use App\Models\AppSetting;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class AppSettingResource extends Resource
{
    protected static ?string $model = AppSetting::class;

    protected static ?string $slug = 'app-settings';

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Admin Settings';

    protected static ?int $navigationSort = 7;

    public static function canCreate(): bool
    {
        return ! AppSetting::query()->exists();
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('consultation_minutes_per_patient')
                    ->label('Consultation Minutes Per Patient')
                    ->numeric()
                    ->required()
                    ->default(20)
                    ->minValue(1)
                    ->maxValue(180)
                    ->helperText('Used for queue ETA and auto consultation end-time calculations.'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('consultation_minutes_per_patient')
                    ->label('Minutes / Patient')
                    ->badge()
                    ->color('primary'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Actions\EditAction::make(),
            ])
            ->bulkActions([
                Actions\BulkActionGroup::make([
                    Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAppSettings::route('/'),
            'create' => Pages\CreateAppSetting::route('/create'),
            'edit' => Pages\EditAppSetting::route('/{record}/edit'),
        ];
    }
}
