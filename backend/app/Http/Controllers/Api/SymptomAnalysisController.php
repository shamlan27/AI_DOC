<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Services\SymptomRecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SymptomAnalysisController extends Controller
{
    public function __construct(private SymptomRecommendationService $symptomRecommendationService)
    {
    }

    public function recommend(Request $request)
    {
        $validated = $request->validate([
            'symptoms' => 'required|string|min:3|max:2000',
            'top_k' => 'nullable|integer|min:1|max:10',
            'duration_days' => 'nullable|integer|min:0|max:365',
            'associated_symptoms' => 'nullable|string|max:500',
            'meal_relation' => 'nullable|string|max:500',
        ]);

        if (! $this->isHealthRelatedInput($validated['symptoms'])) {
            return response()->json([
                'message' => 'Please provide health-related symptoms only (for example: fever, headache, cough, chest pain, dizziness).',
                'suggested_keywords' => ['fever', 'headache', 'cough', 'chest pain', 'dizziness'],
            ], 422);
        }

        try {
            $topK = $validated['top_k'] ?? 3;
            $doctors = Doctor::all();

            if ($doctors->isEmpty()) {
                return response()->json([
                    'doctors' => [],
                    'matched_specialties' => [],
                    'follow_up_required' => false,
                    'follow_up_questions' => [],
                    'triage_summary' => 'direct_recommendation',
                    'urgency_level' => 'low',
                    'urgency_reason' => 'no_doctors_available',
                    'emergency_advice' => 'If symptoms worsen suddenly, seek urgent medical attention.',
                ]);
            }

            $result = $this->symptomRecommendationService->recommend($validated['symptoms'], $doctors, $topK, [
                'duration_days' => $validated['duration_days'] ?? null,
                'associated_symptoms' => $validated['associated_symptoms'] ?? null,
                'meal_relation' => $validated['meal_relation'] ?? null,
            ]);

            $recommendedIds = collect($result['recommended_doctor_ids'] ?? []);
            $matchedSpecialties = collect($result['matched_specialties'] ?? [])
                ->pluck('specialty')
                ->filter()
                ->map(fn ($specialty) => strtolower((string) $specialty))
                ->values();

            if ($recommendedIds->isEmpty() && $matchedSpecialties->isEmpty()) {
                return response()->json([
                    'doctors' => [],
                    'matched_specialties' => [],
                    'follow_up_required' => (bool) ($result['follow_up_required'] ?? false),
                    'follow_up_questions' => $result['follow_up_questions'] ?? [],
                    'triage_summary' => $result['triage_summary'] ?? 'direct_recommendation',
                    'urgency_level' => $result['urgency_level'] ?? 'low',
                    'urgency_reason' => $result['urgency_reason'] ?? null,
                    'emergency_advice' => $result['emergency_advice'] ?? null,
                ]);
            }

            $recommendedDoctors = $recommendedIds
                ->map(fn ($id) => $doctors->firstWhere('id', $id))
                ->filter()
                ->values();

            if ($recommendedDoctors->count() < $topK) {
                $fallbackDoctors = $doctors
                    ->filter(function ($doctor) use ($matchedSpecialties) {
                        if ($matchedSpecialties->isEmpty()) {
                            return true;
                        }

                        return $matchedSpecialties->contains(strtolower((string) $doctor->specialty));
                    })
                    ->sortByDesc('rating')
                    ->filter(fn ($doctor) => ! $recommendedDoctors->contains('id', $doctor->id))
                    ->take($topK - $recommendedDoctors->count())
                    ->values();

                $recommendedDoctors = $recommendedDoctors->concat($fallbackDoctors)->values();
            }

            return response()->json([
                'doctors' => $recommendedDoctors,
                'matched_specialties' => $result['matched_specialties'] ?? [],
                'follow_up_required' => (bool) ($result['follow_up_required'] ?? false),
                'follow_up_questions' => $result['follow_up_questions'] ?? [],
                'triage_summary' => $result['triage_summary'] ?? 'direct_recommendation',
                'urgency_level' => $result['urgency_level'] ?? 'low',
                'urgency_reason' => $result['urgency_reason'] ?? null,
                'emergency_advice' => $result['emergency_advice'] ?? null,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Symptom recommendation failed', [
                'error' => $exception->getMessage(),
            ]);

            $fallbackDoctors = Doctor::query()
                ->orderByDesc('rating')
                ->limit($validated['top_k'] ?? 3)
                ->get();

            return response()->json([
                'doctors' => $fallbackDoctors,
                'matched_specialties' => [],
                'fallback' => true,
                'follow_up_required' => false,
                'follow_up_questions' => [],
                'triage_summary' => 'fallback_recommendation',
                'urgency_level' => 'moderate',
                'urgency_reason' => 'ai_service_unavailable',
                'emergency_advice' => 'If chest pain or breathing issues are severe, seek emergency care immediately.',
            ]);
        }
    }

    private function isHealthRelatedInput(string $text): bool
    {
        $normalized = strtolower(trim($text));

        $greetings = [
            'hi',
            'hello',
            'hey',
            'how are you',
            'good morning',
            'good afternoon',
            'good evening',
        ];

        foreach ($greetings as $greeting) {
            if ($normalized === $greeting || str_contains($normalized, $greeting)) {
                return false;
            }
        }

        return (bool) preg_match('/\b(pain|fever|cough|cold|headache|migraine|dizzy|dizziness|vomit|nausea|stomach|chest|breath|breathing|rash|allergy|sore|throat|fatigue|weak|diabetes|pressure|infection|injury|bleeding|swelling|anxiety|depression|sleep|burn|fracture|symptom)\b/i', $text);
    }
}
