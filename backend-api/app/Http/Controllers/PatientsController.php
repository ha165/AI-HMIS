<?php

namespace App\Http\Controllers;

use App\Models\Patients;
use Illuminate\Http\Request;

class PatientsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patients = Patients::with('user:id,first_name,last_name,email,phone')->get();

        $formatdata = $patients->map(function($patients){
            return [
                'id' => $patients->id,
                'first_name' => $patients->user->first_name, 
                'last_name' => $patients->user->last_name,
                'email' => $patients->user->email,
                'phone' => $patients->user->phone,
                'gender' => $patients->gender,
                'emergency_contact' => $patients->emergency_contact
            ];
        });

        return response()->json($formatdata);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Patients $patients)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patients $patients)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patients $patients)
    {
        
    }
}
