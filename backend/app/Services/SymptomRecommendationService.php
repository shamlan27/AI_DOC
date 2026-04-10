<?php

namespace App\Services;

use Illuminate\Support\Collection;
use RuntimeException;
use Symfony\Component\Process\Process;

class SymptomRecommendationService
{
    public function recommend(string $symptoms, Collection $doctors, int $topK = 3, array $triageContext = []): array
    {
        $scriptPath = base_path(config('services.symptom_ai.script_path', 'ai/symptom_recommender.py'));
        $modelPath = base_path(config('services.symptom_ai.model_path', 'ai/models/symptom_model.json'));
        $datasetPath = base_path(config('services.symptom_ai.dataset_path', 'ai/data/symptom_training_data.json'));

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

        foreach (['duration_days', 'associated_symptoms', 'meal_relation'] as $field) {
            if (array_key_exists($field, $triageContext) && $triageContext[$field] !== null) {
                $payload[$field] = $triageContext[$field];
            }
        }

        $pythonExecutable = config('services.symptom_ai.python_executable', 'python');
        $timeout = (int) config('services.symptom_ai.timeout', 10);

        $command = [$pythonExecutable, $scriptPath, '--model-path', $modelPath, '--dataset-path', $datasetPath];

        $process = new Process($command, base_path());
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
