<?php

namespace App\Http\Controllers;

use App\Models\Medications;
use App\Http\Requests\StoreMedicationsRequest;
use App\Http\Requests\UpdateMedicationsRequest;

class MedicationsController extends Controller
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
    public function store(StoreMedicationsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Medications $medications)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMedicationsRequest $request, Medications $medications)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Medications $medications)
    {
        //
    }
}
