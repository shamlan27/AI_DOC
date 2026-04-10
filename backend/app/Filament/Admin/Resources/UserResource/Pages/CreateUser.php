<?php

namespace App\Filament\Admin\Resources\UserResource\Pages;

use App\Filament\Admin\Resources\UserResource;
use App\Mail\AccountCreatedMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected string $plainPassword = '';

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $this->plainPassword = (string) ($data['password'] ?? Str::random(10));
        $data['password'] = Hash::make($this->plainPassword);

        return $data;
    }

    protected function afterCreate(): void
    {
        try {
            Mail::to($this->record->email)->send(new AccountCreatedMail(
                $this->record->name,
                $this->record->email,
                $this->plainPassword,
            ));
        } catch (\Throwable $e) {
            // Do not block account creation if email fails.
        }
    }
}
