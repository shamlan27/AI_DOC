<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


use App\Mail\OtpMail;
use App\Mail\WelcomeMail;
use App\Mail\DeleteAccountMail;

class AuthController extends Controller
{
    public function sendRegistrationOtp(Request $request)
    {
        \Illuminate\Support\Facades\Log::info("OTP Request for: " . $request->email);
        
        try {
            $request->validate([
                'email' => 'required|string|email|max:255|unique:users',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Validation failed for: " . $request->email);
            throw $e;
        }

        $otp = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('otp_' . $request->email, $otp, now()->addMinutes(10));
        
        \Illuminate\Support\Facades\Log::info("Generated OTP: $otp");

        try {
            \Illuminate\Support\Facades\Mail::to($request->email)->send(new OtpMail($otp));
            \Illuminate\Support\Facades\Log::info("OTP Email sent to: " . $request->email);
        } catch (\Exception $e) {
             \Illuminate\Support\Facades\Log::error("Mail Error: " . $e->getMessage());
             return response()->json(['message' => 'Failed to send OTP email.'], 500);
        }

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::min(8)->mixedCase()->numbers()->symbols()],
            'otp' => 'required|digits:6',
        ]);

        if ($request->otp != \Illuminate\Support\Facades\Cache::get('otp_' . $request->email)) { 
             throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.'],
            ]);
        }
        
        \Illuminate\Support\Facades\Cache::forget('otp_' . $request->email);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Send Welcome Email
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new WelcomeMail($user->name));
        } catch (\Exception $e) {
            // Ignore email failure on welcome
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function sendDeleteOtp(Request $request)
    {
        $user = $request->user();
        $otp = rand(100000, 999999);
        \Illuminate\Support\Facades\Cache::put('delete_otp_' . $user->id, $otp, now()->addMinutes(10));

        try {
             \Illuminate\Support\Facades\Mail::to($user->email)->send(new DeleteAccountMail($otp));
        } catch (\Exception $e) {
             return response()->json(['message' => 'Failed to send OTP email.'], 500);
        }

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:6',
        ]);

        $user = $request->user();

        if ($request->otp != \Illuminate\Support\Facades\Cache::get('delete_otp_' . $user->id)) {
             throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP.'],
            ]);
        }
        
        \Illuminate\Support\Facades\Cache::forget('delete_otp_' . $user->id);
        
        // Revoke tokens
        $user->tokens()->delete();
        
        // Delete user
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return $request->user();
    }
}
