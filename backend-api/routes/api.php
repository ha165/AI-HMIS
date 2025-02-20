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
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;


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
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post("/complete-registration", [PatientsController::class, "completeRegistration"]);
});
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
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

    if ($response->successful()) {
        return response()->json([
            'response' => $response['choices'][0]['message']['content']
        ]);
    } else {
        $errorResponse = $response->json();
        $errorMessage = $errorResponse['error']['message'] ?? 'Failed to retrieve response from OpenAI API';

        return response()->json([
            'error' => $errorMessage
        ], $response->status());
    }
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