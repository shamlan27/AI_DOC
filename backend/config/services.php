<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT'),
    ],

    'symptom_ai' => [
        'python_executable' => env('SYMPTOM_AI_PYTHON', 'python'),
        'script_path' => env('SYMPTOM_AI_SCRIPT', 'ai/symptom_recommender.py'),
        'dataset_path' => env('SYMPTOM_AI_DATASET', 'ai/data/symptom_training_data.json'),
        'model_path' => env('SYMPTOM_AI_MODEL', 'ai/models/symptom_model.json'),
        'timeout' => env('SYMPTOM_AI_TIMEOUT', 10),
        'train_timeout' => env('SYMPTOM_AI_TRAIN_TIMEOUT', 60),
    ],

];
