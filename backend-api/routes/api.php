<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AiDiagnosticsController;
use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\MedicalRecordsController;
use App\Http\Controllers\NotificationsController;
use App\Http\Controllers\PaymentsController;
use App\Http\Controllers\PatientsController;
use App\Http\Controllers\SchedulesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// User authentication route
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Resource routes 
Route::resources([
    'ai_diagnostics' => AiDiagnosticsController::class,
    'appointments' => AppointmentsController::class,
    'billing' => BillingController::class,
    'departments' => DepartmentsController::class,
    'medical_records' => MedicalRecordsController::class,
    'notifications' => NotificationsController::class,
    'payments' => PaymentsController::class,
    'patients' => PatientsController::class,
    'schedules' => SchedulesController::class,
]);
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::put('/users/{user}', [PatientsController::class, 'update']); 
    Route::delete('/users/{user}', [PatientsController::class, 'destroy']); 
});
