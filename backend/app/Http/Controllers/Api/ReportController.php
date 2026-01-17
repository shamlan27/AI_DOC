<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = $request->user()->medicalReports()->latest()->get();
        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_name' => 'required|string',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
            'report_type' => 'nullable|string',
            'report_date' => 'required|date',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('reports', 'public');

            $report = MedicalReport::create([
                'user_id' => Auth::id(),
                'doctor_name' => $request->doctor_name,
                'file_path' => $path,
                'report_type' => $request->report_type ?? 'General',
                'report_date' => $request->report_date,
            ]);

            return response()->json($report, 201);
        }

        return response()->json(['message' => 'File not uploaded'], 400);
    }
}
