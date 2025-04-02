<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Get all services.
     */
    public function index()
    {
        return Service::where('is_active', true)->get();

    }

    /**
     * Store a new service.
     */
    public function store(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'name' => 'required|string|unique:services,name',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);
        $service = Service::create($request->only([
            'name',
            'description',
            'price',
            'duration_minutes',
            'is_active',
        ]));


        return response()->json([
            'message' => 'Service created successfully',
            'service' => $service,
        ], 201);
    }
    /**
     * Get a single service.
     */
    public function show(Service $service)
    {
        return response()->json($service);
    }

    /**
     * Update a service.
     */
    public function update(Request $request, Service $service)
    {
        $request->validate([
            'name' => 'required|string|unique:services,name,' . $service->id,
            'description' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'specialization' => 'required|string',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $service->update($request->all());

        return response()->json(['message' => 'Service updated successfully', 'service' => $service]);
    }

    /**
     * Delete a service.
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return response()->json(['message' => 'Service deleted successfully']);
    }
    public function getDoctors(Service $service)
    {
        return $service->doctors()
            ->with('user')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'first_name' => $doctor->user->first_name,
                    'last_name' => $doctor->user->last_name,
                    'specialization' => $doctor->specialization
                ];
            });
    }
}
