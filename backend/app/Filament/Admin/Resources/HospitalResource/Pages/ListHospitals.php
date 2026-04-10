<?php

namespace App\Filament\Admin\Resources\HospitalResource\Pages;

use App\Filament\Admin\Resources\HospitalResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHospitals extends ListRecords
{
    protected static string $resource = HospitalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
