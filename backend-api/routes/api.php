<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\{
    AuthController,
    AiDiagnosticsController,
    AppointmentsController,
    BillingController,
    DepartmentsController,
    DoctorsController,
    MedicalRecordsController,
    NotificationsController,
    PaymentsController,
    PatientDashboardController,
    PatientsController,
    ServiceController,
    DoctorDashboardController,
    DashBoardController,
    SchedulesController,
    UserController
};

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/dashboard/stats', [DashBoardController::class, 'getDashboardStats']);
Route::post('/payments/mpesa-callback', [PaymentsController::class, 'mpesaCallback']);
// **Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::resources([
        'appointments' => AppointmentsController::class,
        'billing' => BillingController::class,
        'departments' => DepartmentsController::class,
        'medical-records' => MedicalRecordsController::class,
        'notifications' => NotificationsController::class,
        'payments' => PaymentsController::class,
        'patients' => PatientsController::class,
        'schedules' => SchedulesController::class,
        'doctors' => DoctorsController::class,
        'services' => ServiceController::class
    ]);

    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/diagnosis-chat', [AiDiagnosticsController::class, 'chat']);
    Route::get('/chat-history', [AiDiagnosticsController::class, 'history']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/role', [UserController::class, 'getRole']);
    Route::post("/complete-registration", [PatientsController::class, "completeRegistration"]);
    Route::get('/doctors/available', [DoctorsController::class, 'getAvailableDoctors']);
    Route::get('/doctor/{doctor_id}/available-schedules', [SchedulesController::class, 'getAvailableSchedules']);
    Route::get('/services/{service}/doctors', [ServiceController::class, 'getDoctors']);
    Route::get('/doctors/{doctor}/schedules', [DoctorsController::class, 'getSchedules']);
    Route::put('/appointments/{id}/complete', [AppointmentsController::class, 'markComplete']);
    Route::put('/appointments/{appointment}/reschedule', [AppointmentsController::class, 'reschedule']);
    Route::get('/payments/{appointment}', [PaymentsController::class, 'getPaymentDetails']);
    Route::post('/payments/mpesa', [PaymentsController::class, 'initiateMpesaPayment']);
    Route::get('/patient-dashboard', [PatientDashboardController::class, 'index']);
    Route::get('/doctor-dashboard', [DoctorDashboardController::class, 'index']);
    Route::middleware(['admin'])->group(function () {
        Route::put('/users/{user}', [PatientsController::class, 'update']);
        Route::delete('/users/{user}', [PatientsController::class, 'destroy']);
    });

Route::post('/image-analyzer', function (Request $request) {
    if (!$request->hasFile('file')) {
        Log::error("No file received in request");
        return response()->json(['error' => 'No image provided'], 400);
    }

    $image = $request->file('file');
    $apiKey = env('HF_TOKEN');

    Log::info("Image received", [
        'name' => $image->getClientOriginalName(),
        'size' => $image->getSize(),
    ]);
    $endpoint = "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224";

    try {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])
        ->attach('image', file_get_contents($image->path()), $image->getClientOriginalName())
        ->post($endpoint);

        Log::info("HF response status", ['status' => $response->status()]);
        Log::info("HF response body", ['body' => $response->body()]);

        if ($response->failed()) {
            return response()->json([
                'error' => 'HuggingFace API error',
                'details' => $response->body()
            ], 500);
        }

        return response()->json(['analysis' => $response->json()]);

    } catch (\Exception $e) {
        Log::error("Image analyzer crashed", [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'error' => 'Server error',
            'message' => $e->getMessage()
        ], 500);
    }
});


    Route::middleware('auth:sanctum')->get('/payments/status/{payment}', [PaymentsController::class, 'checkPaymentStatus']);
});
