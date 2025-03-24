<?php
namespace App\Http\Controllers;

use App\Models\Schedules;
use Illuminate\Http\Request;

class SchedulesController extends Controller
{
    public function index()
    {
        return response()->json(Schedules::all());
    }

    public function store(Request $request)
    {
        $schedule = Schedules::create([
            'doctor_id' => $request->doctor_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'notes' => $request->notes
        ]);

        return response()->json($schedule, 201);
    }

    public function destroy($id)
    {
        $schedule = Schedules::findOrFail($id);
        $schedule->delete();

        return response()->json(['message' => 'Event deleted successfully']);
    }
    public function getAvailableSchedules($doctor_id)
{
    $schedules = Schedules::where('doctor_id', $doctor_id)
        ->whereDoesntHave('appointments')
        ->get();

    return response()->json($schedules);
}

}
