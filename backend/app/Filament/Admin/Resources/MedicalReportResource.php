<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\MedicalReportResource\Pages;
use App\Models\Appointment;
use App\Models\MedicalReport;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class MedicalReportResource extends Resource
{
    protected static ?string $model = MedicalReport::class;

    protected static ?string $slug = 'medical-reports';

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-document';

    protected static ?string $navigationLabel = 'Medical Reports';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\Select::make('appointment_id')
                    ->label('Appointment Slot')
                    ->relationship(
                        name: 'appointment',
                        titleAttribute: 'id',
                        modifyQueryUsing: fn ($query) => $query->with(['user', 'doctor'])->orderByDesc('date')->orderByDesc('time')
                    )
                    ->getOptionLabelFromRecordUsing(function (Appointment $record): string {
                        $patient = $record->user?->name ?? 'Unknown Patient';
                        $doctor = $record->doctor?->name ?? 'Unknown Doctor';
                        $hospital = $record->booked_hospital;

                        return sprintf(
                            '%s | %s | %s %s | %s',
                            $patient,
                            $doctor,
                            $record->date,
                            $record->time,
                            $hospital
                        );
                    })
                    ->searchable()
                    ->preload()
                    ->live()
                    ->afterStateUpdated(function ($set, ?string $state): void {
                        if (! $state) {
                            return;
                        }

                        $appointment = Appointment::with(['user', 'doctor'])->find($state);
                        if (! $appointment) {
                            return;
                        }

                        $set('user_id', $appointment->user_id);
                        $set('doctor_name', $appointment->doctor?->name);
                        $set('report_date', $appointment->date);
                    })
                    ->helperText('Pick a booked appointment slot to auto-fill patient and doctor.'),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable(),
                Forms\Components\TextInput::make('doctor_name')
                    ->maxLength(255),
                Forms\Components\FileUpload::make('file_path')
                    ->disk('public')
                    ->directory('medical-reports')
                    ->acceptedFileTypes(['application/pdf', 'image/jpeg', 'image/png'])
                    ->maxSize(10240),
                Forms\Components\TextInput::make('report_type')
                    ->maxLength(255),
                Forms\Components\DatePicker::make('report_date'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Patient')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('appointment.booking_id')
                    ->label('Booking ID')
                    ->copyable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('appointment.queue_number')
                    ->label('Queue #')
                    ->badge()
                    ->color('warning')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('appointment.estimated_arrival_time')
                    ->label('Est. Arrival')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('appointment.date')
                    ->label('Appointment Date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('doctor_name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('report_type')
                    ->searchable(),
                Tables\Columns\TextColumn::make('report_date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('report_type'),
            ])
            ->actions([
                Actions\EditAction::make(),
                Actions\DeleteAction::make(),
                Actions\Action::make('download')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->url(fn (MedicalReport $record) => route('reports.download', $record))
                    ->openUrlInNewTab(),
            ])
            ->bulkActions([
                Actions\BulkActionGroup::make([
                    Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->with(['user', 'appointment']);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMedicalReports::route('/'),
            'create' => Pages\CreateMedicalReport::route('/create'),
            'edit' => Pages\EditMedicalReport::route('/{record}/edit'),
        ];
    }
}
