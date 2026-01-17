<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $appointments = $request->user()->appointments()->with('doctor')->latest()->get();
        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date',
            'time' => 'required|string',
            'name' => 'required|string',
            'phone' => 'required|string',
            'nic' => 'required|string', // Requested NIC field
            'payment_mode' => 'required|in:online,counter',
        ]);

        $appointment = Appointment::create([
            'user_id' => Auth::id(),
            'doctor_id' => $request->doctor_id,
            'date' => $request->date,
            'time' => $request->time,
            'name' => $request->name,
            'phone' => $request->phone,
            'nic' => $request->nic,
            'payment_mode' => $request->payment_mode,
            'status' => 'pending',
        ]);

        return response()->json($appointment, 201);
    }
}
