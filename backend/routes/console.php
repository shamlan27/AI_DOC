<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Process\Process;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('symptom-ai:retrain {--dataset=} {--model=}', function () {
    $pythonExecutable = config('services.symptom_ai.python_executable', 'python');
    $scriptPath = base_path(config('services.symptom_ai.script_path', 'ai/symptom_recommender.py'));

    if (! file_exists($scriptPath)) {
        $this->error('Symptom AI script not found.');
        return self::FAILURE;
    }

    $datasetPath = $this->option('dataset') ?: base_path(config('services.symptom_ai.dataset_path', 'ai/data/symptom_training_data.json'));
    $modelPath = $this->option('model') ?: base_path(config('services.symptom_ai.model_path', 'ai/models/symptom_model.json'));
    $timeout = (int) config('services.symptom_ai.train_timeout', 60);

    $command = [$pythonExecutable, $scriptPath, '--train', '--dataset-path', $datasetPath, '--model-path', $modelPath];

    $process = new Process($command, base_path());
    $process->setTimeout($timeout);
    $process->run();

    if (! $process->isSuccessful()) {
        $this->error('Training failed: '.trim($process->getErrorOutput()));
        return self::FAILURE;
    }

    $output = trim($process->getOutput());
    $decoded = json_decode($output, true);

    if (! is_array($decoded)) {
        $this->error('Unexpected training output: '.$output);
        return self::FAILURE;
    }

    $status = $decoded['status'] ?? 'unknown';
    $sampleCount = $decoded['sample_count'] ?? 0;
    $specialtyCount = $decoded['specialty_count'] ?? 0;
    $trainedAt = $decoded['trained_at'] ?? 'n/a';

    $this->info('Symptom AI training status: '.$status);
    $this->line('Samples: '.$sampleCount);
    $this->line('Specialties: '.$specialtyCount);
    $this->line('Model: '.($decoded['model_path'] ?? $modelPath));
    $this->line('Trained at: '.$trainedAt);

    return self::SUCCESS;
})->purpose('Retrain and persist the symptom recommendation AI model');
