<?php

namespace App\Providers;

use App\Filament\Admin\Resources\DoctorResource;
use App\Filament\Admin\Resources\HospitalResource;
use App\Filament\Admin\Resources\MedicalReportResource;
use App\Filament\Admin\Resources\PaymentResource;
use App\Filament\Admin\Resources\UserResource;
use App\Filament\Admin\Resources\AppointmentResource;
use Filament\Facades\Filament;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Http\Middleware\IdentifyTenant;
use Filament\Panel;
use Filament\PanelProvider;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\ServiceProvider;

class FilamentServiceProvider extends PanelProvider
{
    public function register(): void
    {
        //
    }

    public function panel(Panel $panel): Panel
    {
        return $panel
            ->name('Admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => '#3b82f6',
            ])
            ->discoverResources(in: app_path('Filament/Admin/Resources'), for: 'App\\Filament\\Admin\\Resources')
            ->discoverPages(in: app_path('Filament/Admin/Pages'), for: 'App\\Filament\\Admin\\Pages')
            ->pages([
                // Add custom pages here if needed
            ])
            ->widgets([
                // Add custom widgets here if needed
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                VerifyCsrfToken::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->authGuard('web');
    }
}
