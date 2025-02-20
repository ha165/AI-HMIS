<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Patients;
use App\Http\Requests\StoreBillingRequest;
use App\Http\Requests\UpdateBillingRequest;


class BillingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            // Admin sees all billing records
            $billings = Billing::with("patient.user")->get();
        } else {
            // Patients see only their own billing records
            $billings = Billing::with("patient.user")
                ->whereHas('patient', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->get();
        }

        $formatdata = $billings->map(function ($billing) {
            return [
                "id" => $billing->id,
                "first_name" => $billing->patient->user->first_name,
                'last_name' => $billing->patient->user->last_name,
                'email' => $billing->patient->user->email,
                'phone' => $billing->patient->user->phone,
                'gender' => $billing->patient->gender,
                'amount' => $billing->amount,
                'status' => $billing->status,
                'due_date' => $billing->due_date
            ];
        });

        return response()->json($formatdata);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBillingRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Billing $billing)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBillingRequest $request, Billing $billing)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Billing $billing)
    {
        //
    }
}
