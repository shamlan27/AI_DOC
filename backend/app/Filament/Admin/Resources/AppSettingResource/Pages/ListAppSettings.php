<?php

namespace App\Filament\Admin\Resources\AppSettingResource\Pages;

use App\Filament\Admin\Resources\AppSettingResource;
use App\Models\AppSetting;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAppSettings extends ListRecords
{
    protected static string $resource = AppSettingResource::class;

    protected function getHeaderActions(): array
    {
        return AppSetting::query()->exists()
            ? []
            : [Actions\CreateAction::make()];
    }
}
