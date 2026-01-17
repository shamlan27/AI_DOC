<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl()
        ]);
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'password' => bcrypt(Str::random(16)), // Dummy password
                    // 'google_id' => $googleUser->getId(), // Add column if you want strict mapping
                ]
            );

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend with token
            return redirect('http://localhost:3000/auth/callback?token=' . $token);
        } catch (\Exception $e) {
            return redirect('http://localhost:3000/auth/login?error=social_callback_failed&message=' . urlencode($e->getMessage()));
        }
    }
}
