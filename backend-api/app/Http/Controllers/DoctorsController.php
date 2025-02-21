<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $doctors = Doctor::with('user')->get();

        $formatdata = $doctors->map(function ($doctors) {
            return [
                "id" => $doctors->id,
                "first_name" => $doctors->user->first_name,
                "last_name" => $doctors->user->last_name,
                "email" => $doctors->user->email,
                "phone" => $doctors->user->phone,
                "specialization" => $doctors->specialization,
                "address" => $doctors->address,
                "licence_number" => $doctors->license_number
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
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
