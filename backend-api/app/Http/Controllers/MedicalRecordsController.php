<?php

namespace App\Http\Controllers;

use App\Models\Medical_Records;
use Illuminate\Http\Request;

class MedicalRecordsController extends Controller
{
    public function index()
    {
        $records = Medical_Records::all();
        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'patient_id' => 'required|integer',
            'doctor_id' => 'required|integer',
            'appointment_id' => 'nullable|integer',
            'diagnosis' => 'nullable|string',
            'prescription' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'medications' => 'nullable|string',
            'allergies' => 'nullable|string',
            'vital_signs' => 'nullable|json',
            'treatment_plan' => 'nullable|string',
            'lab_results' => 'nullable|json',
            'notes' => 'nullable|string',
            'status' => 'in:draft,finalized',
        ]);

        $record = Medical_Records::create($validatedData);
        return response()->json($record, 201);
    }

    public function show($id)
    {
        $record = Medical_Records::findOrFail($id);
        return response()->json($record);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'diagnosis' => 'sometimes|nullable|string',
            'prescription' => 'sometimes|nullable|string',
            'medical_history' => 'sometimes|nullable|string',
            'medications' => 'sometimes|nullable|string',
            'allergies' => 'sometimes|nullable|string',
            'vital_signs' => 'sometimes|nullable|json',
            'treatment_plan' => 'sometimes|nullable|string',
            'lab_results' => 'sometimes|nullable|json',
            'notes' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:draft,finalized',
        ]);

        $record = Medical_Records::findOrFail($id);
        $record->update($validatedData);
        return response()->json($record);
    }

    public function destroy($id)
    {
        $record = Medical_Records::findOrFail($id);
        $record->delete();
        return response()->json(null, 204);
    }
}