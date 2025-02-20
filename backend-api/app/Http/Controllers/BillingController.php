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
       $billings = Billing::with("patient:id,first_name,last_name,email,phone")->get();

       $formatdata = $billings->map(function($billings):array{
         
        return [
            "first_name" => $billings->user->first_name,
            'last_name' => $billings->user->last_name,
            'email' => $billings->user->email,
            'phone' => $billings->user->phone,
            'gender' => $billings->gender,
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
