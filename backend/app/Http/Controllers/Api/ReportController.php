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
        $reports = $request->user()->medicalReports()->with(['appointment', 'user'])->latest()->get();
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

    public function download(Request $request, MedicalReport $report)
    {
        $user = $request->user();

        if (! $user || ($report->user_id !== $user->id && ! $user->is_admin)) {
            abort(403, 'You are not authorized to download this report.');
        }

        if (! $report->file_path) {
            abort(404, 'Report file not found.');
        }

        $storedPath = trim((string) $report->file_path);

        $candidatePaths = array_values(array_unique(array_filter([
            $storedPath,
            ltrim(preg_replace('#^(public|private)/#', '', $storedPath) ?? '', '/'),
        ])));

        $resolvedDisk = null;
        $resolvedPath = null;

        foreach (['public', 'local'] as $diskName) {
            foreach ($candidatePaths as $candidatePath) {
                if (Storage::disk($diskName)->exists($candidatePath)) {
                    $resolvedDisk = $diskName;
                    $resolvedPath = $candidatePath;
                    break 2;
                }
            }
        }

        if (! $resolvedDisk || ! $resolvedPath) {
            abort(404, 'Report file not found.');
        }

        $extension = pathinfo($resolvedPath, PATHINFO_EXTENSION);
        $safeDate = $report->report_date ? date('Y-m-d', strtotime((string) $report->report_date)) : now()->format('Y-m-d');
        $filename = sprintf('medical-report-%d-%s.%s', $report->id, $safeDate, $extension ?: 'pdf');

        return response()->download(Storage::disk($resolvedDisk)->path($resolvedPath), $filename);
    }
}
