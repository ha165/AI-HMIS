<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Route::get('/user', function (Request $request) {
//return $request->user();
//})->middleware('auth:sanctum');
Route::apiResource("appointments",App\Http\Controllers\AppointmentController::class)->middleware("auth:sanctum","");
Route::get("/", function (Request $request) {
    return "API";
});
