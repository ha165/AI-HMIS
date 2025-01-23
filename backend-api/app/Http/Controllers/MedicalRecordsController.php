<?php

namespace App\Http\Controllers;

use App\Models\Medical_records;
use App\Http\Requests\StoreMedical_recordsRequest;
use App\Http\Requests\UpdateMedical_recordsRequest;

class MedicalRecordsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMedical_recordsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Medical_records $medical_records)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedical_recordsRequest $request, Medical_records $medical_records)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Medical_records $medical_records)
    {
        //
    }
}
