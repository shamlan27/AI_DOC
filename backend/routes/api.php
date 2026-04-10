<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\HospitalController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SymptomAnalysisController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Routes
// Public Routes
Route::post('/send-registration-otp', [AuthController::class, 'sendRegistrationOtp']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [\App\Http\Controllers\Api\ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [\App\Http\Controllers\Api\NewPasswordController::class, 'store']);
Route::post('/analyze-report', [\App\Http\Controllers\Api\ReportAnalysisController::class, 'analyze']);
Route::post('/symptom-recommendations', [SymptomAnalysisController::class, 'recommend']);

Route::get('/test-email', function (Request $request) {
    $email = $request->query('email', 'test@example.com');
    try {
        Illuminate\Support\Facades\Mail::raw("This is a test email from AI Doc. Time: " . now(), function ($message) use ($email) {
            $message->to($email)
                ->subject('AI Doc Test Email');
        });
        return response()->json(['message' => "Email sent successfully to $email via " . config('mail.default')]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

Route::get('/auth/google/redirect', [\App\Http\Controllers\Api\SocialAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [\App\Http\Controllers\Api\SocialAuthController::class, 'handleGoogleCallback']); // Must match env GOOGLE_REDIRECT

Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{id}', [DoctorController::class, 'show']);
Route::get('/doctors/{id}/slot-availability', [DoctorController::class, 'slotAvailability']);
Route::get('/hospitals', [HospitalController::class, 'index']);
Route::get('/hospitals/{id}', [HospitalController::class, 'show']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::patch('/appointments/{appointment}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::post('/appointments/{appointment}/review', [AppointmentController::class, 'submitReview']);

    // Medical Reports
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/{report}/download', [ReportController::class, 'download']);

    // Account Management
    Route::post('/send-delete-otp', [AuthController::class, 'sendDeleteOtp']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);
});
