<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
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
    PatientsController,
    ServiceController,
    SchedulesController,
    UserController
};

// Public authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// **Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::resources([
        'ai_diagnostics' => AiDiagnosticsController::class,
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

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/role', [UserController::class, 'getRole']);
    Route::post("/complete-registration", [PatientsController::class, "completeRegistration"]);
    Route::get('/doctors/available', [DoctorsController::class, 'getAvailableDoctors']);
    Route::get('/doctor/{doctor_id}/available-schedules', [SchedulesController::class, 'getAvailableSchedules']);
    Route::get('/services/{service}/doctors', [ServiceController::class, 'getDoctors']);
    Route::get('/doctors/{doctor}/schedules', [DoctorsController::class, 'getSchedules']);
    Route::put('/appointments/{id}/complete', [AppointmentsController::class, 'markComplete']);
    Route::put('/appointments/{appointment}/reschedule', [AppointmentsController::class, 'reschedule']);

    Route::middleware(['admin'])->group(function () {
        Route::put('/users/{user}', [PatientsController::class, 'update']);
        Route::delete('/users/{user}', [PatientsController::class, 'destroy']);
    });

    Route::post('/diagnosis-chat', function (Request $request): JsonResponse {
        $userMessage = $request->input('message');
        $apiKey = env('OPENAI_API_KEY');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [['role' => 'user', 'content' => $userMessage]],
                    'max_tokens' => 100,
                ]);

        return $response->successful()
            ? response()->json(['response' => $response['choices'][0]['message']['content']])
            : response()->json(['error' => $response->json()['error']['message'] ?? 'Failed to retrieve response'], $response->status());
    });

    Route::post('/image-analyzer', function (Request $request) {
        $image = $request->file('image');

        if (!$image) {
            return response()->json(['error' => 'No image provided'], 400);
        }

        $apiKey = env('HUGGINGFACE_API_KEY');
        $endpoint = 'https://api-inference.huggingface.co/models/microsoft/resnet-50';

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'multipart/form-data',
        ])->attach('image', file_get_contents($image->path()), $image->getClientOriginalName())
            ->post($endpoint);

        return response()->json(['analysis' => $response->json()]);
    });
});
