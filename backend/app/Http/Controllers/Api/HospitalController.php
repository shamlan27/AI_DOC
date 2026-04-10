<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hospital;
use Illuminate\Http\JsonResponse;

class HospitalController extends Controller
{
    public function index(): JsonResponse
    {
        $hospitals = Hospital::query()
            ->where('is_active', true)
            ->select(['id', 'name', 'city', 'phone', 'email', 'address', 'total_beds'])
            ->orderBy('name')
            ->get();

        return response()->json($hospitals);
    }

    public function show(int $id): JsonResponse
    {
        $hospital = Hospital::query()
            ->where('is_active', true)
            ->select(['id', 'name', 'city', 'phone', 'email', 'address', 'total_beds'])
            ->findOrFail($id);

        return response()->json($hospital);
    }
}
