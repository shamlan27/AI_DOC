<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $models = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
    ];

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    public function analyzeReport($fileContent, $mimeType)
    {
        // Convert file content to base64
        $base64Data = base64_encode($fileContent);

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => "You are an expert medical AI assistant. Analyze this medical report and provide a structured summary in Markdown format. Include:
1. **Patient & Report Details**: Name, Date, Type of Report (if visible).
2. **Key Findings**: List the most important metrics or observations. Highlight abnormal values in **bold**.
3. **Diagnosis/Indications**: What does this report suggest?
4. **Recommendations**: General medical advice based on these findings (include a disclaimer).
5. **Disclaimer**: ALWAYS start or end with: 'I am an AI, not a doctor. Please consult a specialist.'"
                        ],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $base64Data
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $lastException = null;

        foreach ($this->models as $model) {
            try {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$this->apiKey}";
                
                Log::info("Attempting analysis with model: {$model}");

                $response = Http::withoutVerifying()
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                    ])->post($url, $payload);

                if ($response->successful()) {
                    Log::info("Success with model: {$model}");
                    return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'No analysis generated.';
                }

                // If failed, log and try next
                Log::warning("Model {$model} failed", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

            } catch (\Exception $e) {
                Log::error("Exception with model {$model}: " . $e->getMessage());
                $lastException = $e;
            }
        }

        // If all failed
        throw new \Exception('All AI models failed to process the report. Please try again later.');
    }
}
