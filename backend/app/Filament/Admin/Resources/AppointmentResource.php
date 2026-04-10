<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\AppointmentResource\Pages;
use App\Filament\Admin\Resources\MedicalReportResource;
use App\Models\Appointment;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class AppointmentResource extends Resource
{
    protected static ?string $model = Appointment::class;

    protected static ?string $slug = 'appointments';

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-calendar';

    protected static ?string $navigationLabel = 'Appointments';

    protected static ?int $navigationSort = 6;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Appointment Details')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->required()
                            ->searchable(),
                        Forms\Components\Select::make('doctor_id')
                            ->relationship('doctor', 'name')
                            ->required()
                            ->searchable(),
                        Forms\Components\TextInput::make('hospital')
                            ->maxLength(255),
                        Forms\Components\DatePicker::make('date')
                            ->required(),
                        Forms\Components\TimePicker::make('time')
                            ->required(),
                    ])->columns(2),
                Section::make('Patient Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('phone')
                            ->tel()
                            ->required()
                            ->maxLength(20),
                        Forms\Components\TextInput::make('nic')
                            ->label('NIC/ID')
                            ->maxLength(255),
                    ])->columns(2),
                Section::make('Payment & Status')
                    ->schema([
                        Forms\Components\Select::make('payment_mode')
                            ->options([
                                'online' => 'Online',
                                'counter' => 'Counter',
                            ])
                            ->searchable(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'confirmed' => 'Confirmed',
                                'completed' => 'Completed',
                                'cancelled' => 'Cancelled',
                            ])
                            ->default('pending'),
                    ])->columns(2),
                Section::make('Consultation')
                    ->schema([
                        Forms\Components\TextInput::make('consultation_summary')
                            ->maxLength(255)
                            ->placeholder('Short diagnosis or outcome summary'),
                        Forms\Components\DateTimePicker::make('consulted_at')
                            ->seconds(false),
                        Forms\Components\Textarea::make('consultation_notes')
                            ->rows(5)
                            ->columnSpanFull()
                            ->placeholder('Consultation notes, recommendations, and follow-up guidance.'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('booking_id')
                    ->label('Booking ID')
                    ->copyable()
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Booked As')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Account User')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('phone')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('doctor.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('booked_hospital')
                    ->label('Booked Hospital')
                    ->badge()
                    ->color('info')
                    ->searchable(query: function ($query, string $search) {
                        $query->where('hospital', 'like', "%{$search}%");
                    }),
                Tables\Columns\TextColumn::make('queue_number')
                    ->label('Queue #')
                    ->badge()
                    ->color('warning'),
                Tables\Columns\TextColumn::make('estimated_arrival_time')
                    ->label('Est. Arrival')
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('time'),
                Tables\Columns\TextColumn::make('payment_mode')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'online' => 'primary',
                        'counter' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('consultation_summary')
                    ->limit(40)
                    ->toggleable(),
                Tables\Columns\TextColumn::make('consulted_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\Filter::make('current')
                    ->label('Current & Upcoming')
                    ->query(fn ($query) => $query->whereDate('date', '>=', now()->toDateString())),
                Tables\Filters\Filter::make('past')
                    ->label('Previous')
                    ->query(fn ($query) => $query->whereDate('date', '<', now()->toDateString())),
                Tables\Filters\SelectFilter::make('status'),
                Tables\Filters\SelectFilter::make('payment_mode'),
            ])
            ->actions([
                Actions\Action::make('printSlip')
                    ->label('Print Slip')
                    ->icon('heroicon-o-printer')
                    ->url(fn (Appointment $record): string => route('appointments.slip', $record))
                    ->openUrlInNewTab(),
                Actions\Action::make('uploadReport')
                    ->label('Upload Report')
                    ->icon('heroicon-o-document-arrow-up')
                    ->color('primary')
                    ->url(fn (Appointment $record): string => MedicalReportResource::getUrl('create', [
                        'appointment_id' => $record->id,
                    ])),
                Actions\Action::make('markConsulted')
                    ->label('Mark Consulted')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Appointment $record): void {
                        $record->update([
                            'status' => 'completed',
                            'consulted_at' => now(),
                        ]);
                    })
                    ->visible(fn (Appointment $record): bool => $record->status !== 'completed'),
                Actions\EditAction::make(),
                Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Actions\BulkActionGroup::make([
                    Actions\DeleteBulkAction::make(),
                ]),
            ])
                ->defaultSort('date', 'asc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAppointments::route('/'),
            'create' => Pages\CreateAppointment::route('/create'),
            'edit' => Pages\EditAppointment::route('/{record}/edit'),
        ];
    }
}
