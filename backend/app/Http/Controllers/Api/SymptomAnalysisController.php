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
        ]);

        try {
            $topK = $validated['top_k'] ?? 3;
            $doctors = Doctor::all();

            if ($doctors->isEmpty()) {
                return response()->json([
                    'doctors' => [],
                    'matched_specialties' => [],
                ]);
            }

            $result = $this->symptomRecommendationService->recommend($validated['symptoms'], $doctors, $topK);

            $recommendedIds = collect($result['recommended_doctor_ids'] ?? []);

            $recommendedDoctors = $recommendedIds
                ->map(fn ($id) => $doctors->firstWhere('id', $id))
                ->filter()
                ->values();

            if ($recommendedDoctors->count() < $topK) {
                $fallbackDoctors = $doctors
                    ->sortByDesc('rating')
                    ->filter(fn ($doctor) => ! $recommendedDoctors->contains('id', $doctor->id))
                    ->take($topK - $recommendedDoctors->count())
                    ->values();

                $recommendedDoctors = $recommendedDoctors->concat($fallbackDoctors)->values();
            }

            return response()->json([
                'doctors' => $recommendedDoctors,
                'matched_specialties' => $result['matched_specialties'] ?? [],
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
            ]);
        }
    }
}
