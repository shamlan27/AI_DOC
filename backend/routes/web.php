<?php

use App\Models\Appointment;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware('auth')->group(function () {
    Route::get('/reports/{report}/download', [ReportController::class, 'download'])
        ->name('reports.download');

    Route::get('/appointments/{appointment}/slip', function (Request $request, Appointment $appointment) {
        $user = $request->user();

        abort_unless($user && ($user->is_admin || $user->id === $appointment->user_id), 403);

        $appointment->loadMissing(['doctor', 'payment', 'user']);

        return view('appointments.slip', [
            'appointment' => $appointment,
        ]);
    })->name('appointments.slip');
});
