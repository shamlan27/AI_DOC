<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdminCommand extends Command
{
    protected $signature = 'make:admin {email : The email of the user to make admin}';
    protected $description = 'Make a user an admin';

    public function handle()
    {
        $email = $this->argument('email');
        
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $user->update(['is_admin' => true]);

        $this->info("User {$email} is now an admin!");
        return 0;
    }
}
