<?php

namespace App\Services;

use Illuminate\Support\Collection;
use RuntimeException;
use Symfony\Component\Process\Process;

class SymptomRecommendationService
{
    public function recommend(string $symptoms, Collection $doctors, int $topK = 3): array
    {
        $scriptPath = base_path(config('services.symptom_ai.script_path', 'ai/symptom_recommender.py'));

        if (! file_exists($scriptPath)) {
            throw new RuntimeException('Symptom AI script not found.');
        }

        $payload = [
            'symptoms' => $symptoms,
            'top_k' => $topK,
            'doctors' => $doctors->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'specialty' => $doctor->specialty,
                    'availability' => $doctor->availability,
                    'rating' => $doctor->rating,
                ];
            })->values()->all(),
        ];

        $pythonExecutable = config('services.symptom_ai.python_executable', 'python');
        $timeout = (int) config('services.symptom_ai.timeout', 10);

        $process = new Process([$pythonExecutable, $scriptPath], base_path());
        $process->setInput(json_encode($payload));
        $process->setTimeout($timeout);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new RuntimeException('Symptom AI process failed: '.$process->getErrorOutput());
        }

        $output = trim($process->getOutput());
        $decoded = json_decode($output, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('Invalid response from symptom AI process.');
        }

        return $decoded;
    }
}
