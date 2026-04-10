<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\DoctorResource\Pages;
use App\Models\AppSetting;
use App\Models\Doctor;
use App\Models\Hospital;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Carbon;

class DoctorResource extends Resource
{
    protected static ?string $model = Doctor::class;

    protected static ?string $slug = 'doctors';

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationLabel = 'Doctors';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('specialty')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('availability')
                    ->label('Availability Summary')
                    ->placeholder('Example: Available Today / On Schedule')
                    ->helperText('Optional quick status for admin. Actual booking slots come from hospital schedules below.')
                    ->maxLength(255),
                Forms\Components\Repeater::make('hospital_schedules')
                    ->label('Hospital-wise Available Time Slots')
                    ->helperText('Add each hospital with its available slots. Patients can only book/reschedule using these slots.')
                    ->rule(function () {
                        return function (string $attribute, $value, \Closure $fail): void {
                            if (! is_array($value)) {
                                return;
                            }

                            $hospitals = collect($value)
                                ->pluck('hospital')
                                ->filter(fn ($hospital) => is_string($hospital) && trim($hospital) !== '')
                                ->map(fn (string $hospital) => strtolower(trim($hospital)));

                            if ($hospitals->count() !== $hospitals->unique()->count()) {
                                $fail('Duplicate hospital entries are not allowed in doctor availability schedules.');
                            }
                        };
                    })
                    ->schema([
                        Forms\Components\Select::make('hospital')
                            ->label('Hospital')
                            ->options(fn (): array => Hospital::query()
                                ->where('is_active', true)
                                ->orderBy('name')
                                ->pluck('name', 'name')
                                ->toArray())
                            ->disableOptionsWhenSelectedInSiblingRepeaterItems()
                            ->searchable()
                            ->required(),
                        Forms\Components\TagsInput::make('time_slots')
                            ->label('Available Time Slots')
                            ->placeholder('Add a slot and press Enter (e.g. 09:00 AM)')
                            ->helperText('Use a readable format like 09:00 AM, 09:30 AM, 10:00 AM.')
                            ->required(),
                        Forms\Components\TimePicker::make('consultation_end_time')
                            ->label('Consultation End Time')
                            ->seconds(false)
                            ->helperText('Optional hard stop time. If empty, end time is auto-calculated using last slot + (max patients per slot * admin configured minutes per patient).')
                            ->nullable(),
                        Forms\Components\TextInput::make('max_patients_per_slot')
                            ->label('Max Patients Per Slot')
                            ->numeric()
                            ->default(1)
                            ->minValue(1)
                            ->required()
                            ->helperText('Seat limit for each time slot at this hospital.'),
                        Forms\Components\CheckboxList::make('available_days')
                            ->label('Available Days')
                            ->options([
                                'Monday' => 'Monday',
                                'Tuesday' => 'Tuesday',
                                'Wednesday' => 'Wednesday',
                                'Thursday' => 'Thursday',
                                'Friday' => 'Friday',
                                'Saturday' => 'Saturday',
                                'Sunday' => 'Sunday',
                            ])
                            ->helperText('Optional: select days for this hospital schedule. If empty, all days are allowed.')
                            ->columns(4)
                            ->columnSpanFull(),
                        Forms\Components\TagsInput::make('specific_dates')
                            ->label('Specific Available Dates (Optional)')
                            ->placeholder('YYYY-MM-DD (e.g. 2026-04-10)')
                            ->helperText('Optional: if provided, only these exact dates are allowed for this hospital schedule.')
                            ->columnSpanFull(),
                    ])
                    ->columns(2)
                    ->reorderable()
                    ->default([])
                    ->columnSpanFull(),
                Forms\Components\FileUpload::make('image')
                    ->image()
                    ->directory('doctors'),
                Forms\Components\TextInput::make('rating')
                    ->numeric()
                    ->step(0.1)
                    ->minValue(0)
                    ->maxValue(5),
                Forms\Components\TextInput::make('consultation_fee')
                    ->label('Consultation Fee (LKR)')
                    ->numeric()
                    ->default(1500)
                    ->required()
                    ->minValue(0)
                    ->step(0.01)
                    ->prefix('LKR'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('specialty')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('availability')
                    ->label('Availability')
                    ->badge()
                    ->formatStateUsing(function (?string $state, Doctor $record): string {
                        $summary = trim((string) $state);
                        if ($summary !== '') {
                            return $summary;
                        }

                        $scheduleCount = collect($record->hospital_schedules ?? [])
                            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                            ->count();

                        return $scheduleCount > 0
                            ? "Configured by hospital schedules ({$scheduleCount})"
                            : 'Not configured';
                    })
                    ->color(fn (string $state): string => str_contains(strtolower($state), 'not configured') ? 'danger' : 'success'),
                Tables\Columns\TextColumn::make('hospitals_summary')
                    ->label('Hospitals')
                    ->getStateUsing(function (Doctor $record): string {
                        $hospitals = collect($record->hospital_schedules ?? [])
                            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                            ->pluck('hospital')
                            ->map(fn ($name) => trim((string) $name))
                            ->filter()
                            ->unique()
                            ->values();

                        return $hospitals->isNotEmpty() ? $hospitals->implode(', ') : 'No hospitals configured';
                    })
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('time_slots_summary')
                    ->label('Time Slots')
                    ->getStateUsing(function (Doctor $record): string {
                        $schedules = collect($record->hospital_schedules ?? [])
                            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                            ->map(function ($item) {
                                $slots = collect($item['time_slots'] ?? [])
                                    ->filter(fn ($slot) => is_string($slot) && trim($slot) !== '')
                                    ->count();

                                return trim((string) ($item['hospital'] ?? 'Hospital')) . ': ' . $slots . ' slots';
                            })
                            ->values();

                        return $schedules->isNotEmpty() ? $schedules->implode(' | ') : 'No time slots configured';
                    })
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('end_time_summary')
                    ->label('End Time')
                    ->getStateUsing(function (Doctor $record): string {
                        $schedules = collect($record->hospital_schedules ?? [])
                            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                            ->map(function ($item) {
                                $calculatedEndTime = static::resolveConsultationEndTimeForDisplay($item);
                                $manualEndTime = trim((string) ($item['consultation_end_time'] ?? ''));

                                if ($manualEndTime !== '') {
                                    $endText = $calculatedEndTime !== '' ? $calculatedEndTime . ' (manual)' : $manualEndTime . ' (manual)';
                                } else {
                                    $endText = $calculatedEndTime !== '' ? $calculatedEndTime . ' (auto)' : 'Not set';
                                }

                                return trim((string) ($item['hospital'] ?? 'Hospital')) . ': ' . $endText;
                            })
                            ->values();

                        return $schedules->isNotEmpty() ? $schedules->implode(' | ') : 'No end time configured';
                    })
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('seat_limit_summary')
                    ->label('Seat Limit')
                    ->getStateUsing(function (Doctor $record): string {
                        $schedules = collect($record->hospital_schedules ?? [])
                            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                            ->map(function ($item) {
                                $limit = max(1, (int) ($item['max_patients_per_slot'] ?? 1));
                                return trim((string) ($item['hospital'] ?? 'Hospital')) . ': ' . $limit . '/slot';
                            })
                            ->values();

                        return $schedules->isNotEmpty() ? $schedules->implode(' | ') : 'No seat limits configured';
                    })
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('days_summary')
                    ->label('Days')
                    ->getStateUsing(function (Doctor $record): string {
                        $schedules = collect($record->hospital_schedules ?? [])
                            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                            ->map(function ($item) {
                                $days = collect($item['available_days'] ?? [])
                                    ->filter(fn ($day) => is_string($day) && trim($day) !== '')
                                    ->values();

                                $dayText = $days->isNotEmpty() ? $days->implode(', ') : 'All days';

                                return trim((string) ($item['hospital'] ?? 'Hospital')) . ': ' . $dayText;
                            })
                            ->values();

                        return $schedules->isNotEmpty() ? $schedules->implode(' | ') : 'No day configuration';
                    })
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('dates_summary')
                    ->label('Specific Dates')
                    ->getStateUsing(function (Doctor $record): string {
                        $schedules = collect($record->hospital_schedules ?? [])
                            ->filter(fn ($item) => is_array($item) && ! empty($item['hospital']))
                            ->map(function ($item) {
                                $dates = collect($item['specific_dates'] ?? [])
                                    ->filter(fn ($date) => is_string($date) && trim($date) !== '')
                                    ->values();

                                $dateText = $dates->isNotEmpty() ? $dates->implode(', ') : 'Not set';

                                return trim((string) ($item['hospital'] ?? 'Hospital')) . ': ' . $dateText;
                            })
                            ->values();

                        return $schedules->isNotEmpty() ? $schedules->implode(' | ') : 'No specific dates';
                    })
                    ->wrap()
                    ->toggleable(),
                Tables\Columns\ImageColumn::make('image')
                    ->circular(),
                Tables\Columns\TextColumn::make('rating')
                    ->numeric(2),
                Tables\Columns\TextColumn::make('consultation_fee')
                    ->label('Fee (LKR)')
                    ->numeric(2)
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Actions\EditAction::make(),
                Actions\DeleteAction::make(),
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
            'index' => Pages\ListDoctors::route('/'),
            'create' => Pages\CreateDoctor::route('/create'),
            'edit' => Pages\EditDoctor::route('/{record}/edit'),
        ];
    }

    private static function resolveConsultationEndTimeForDisplay(array $schedule): string
    {
        $manualEnd = static::normalizeTime((string) ($schedule['consultation_end_time'] ?? ''));
        if ($manualEnd !== '') {
            return $manualEnd;
        }

        $maxPatientsPerSlot = max(1, (int) ($schedule['max_patients_per_slot'] ?? 1));

        $normalizedSlots = collect($schedule['time_slots'] ?? [])
            ->filter(fn ($slot) => is_string($slot) && trim($slot) !== '')
            ->map(fn ($slot) => static::normalizeTime((string) $slot))
            ->filter(fn ($slot) => $slot !== '')
            ->values();

        $firstSlot = $normalizedSlots->first();
        if (! is_string($firstSlot) || trim($firstSlot) === '') {
            return '';
        }

        $firstSlotMinutes = static::timeToMinutes($firstSlot);
        if (is_null($firstSlotMinutes)) {
            return '';
        }

        $minutesPerPatient = AppSetting::consultationMinutesPerPatient();
        $slotCount = max(1, $normalizedSlots->count());
        $totalPatientCapacity = $slotCount * $maxPatientsPerSlot;
        $endMinutes = $firstSlotMinutes + ($totalPatientCapacity * $minutesPerPatient);
        $hours = (int) floor($endMinutes / 60) % 24;
        $minutes = $endMinutes % 60;

        return Carbon::createFromTime($hours, $minutes)->format('h:i A');
    }

    private static function normalizeTime(string $value): string
    {
        $time = trim($value);
        if ($time === '') {
            return '';
        }

        foreach (['g:i A', 'g:i a', 'h:i A', 'h:i a', 'H:i', 'H:i:s'] as $format) {
            try {
                return Carbon::createFromFormat($format, $time)->format('h:i A');
            } catch (\Throwable $e) {
                // Try next format.
            }
        }

        return strtoupper(preg_replace('/\s+/', ' ', $time) ?? $time);
    }

    private static function timeToMinutes(string $time): ?int
    {
        try {
            $parsed = Carbon::createFromFormat('h:i A', $time);
            return ((int) $parsed->format('H')) * 60 + ((int) $parsed->format('i'));
        } catch (\Throwable $e) {
            return null;
        }
    }
}
