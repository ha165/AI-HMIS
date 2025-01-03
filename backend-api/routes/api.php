<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

//Route::get('/user', function (Request $request) {
//return $request->user();
//})->middleware('auth:sanctum');::class)->middleware("auth:sanctum","");
Route::apiResource("appointments", AppointmentController::class);
Route::apiResource("posts", PostController::class);
