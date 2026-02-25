<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\IepController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\StatsController;

// Public routes (no authentication required)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public API - Domains & Goal Bank
Route::get('/domains', [DomainController::class, 'index']);
Route::get('/domains/{id}', [DomainController::class, 'show']);

// Public API - Statistics
Route::get('/stats/public', [StatsController::class, 'public']);
Route::get('/stats', [StatsController::class, 'public']); // Alias for /stats/public

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/auth/me', [AuthController::class, 'getMe']);
    Route::put('/auth/updatepassword', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Student routes
    Route::apiResource('students', StudentController::class);

    // IEP routes (nested under students)
    Route::get('students/{studentId}/ieps', [IepController::class, 'index']);
    Route::post('students/{studentId}/ieps', [IepController::class, 'store']);
    Route::get('ieps/{id}', [IepController::class, 'show']);
    Route::put('ieps/{id}', [IepController::class, 'update']);

    // Log routes (nested under students)
    Route::get('students/{studentId}/logs', [LogController::class, 'index']);
    Route::post('students/{studentId}/logs', [LogController::class, 'store']);
    Route::get('logs/{id}', [LogController::class, 'show']);

    // Goal routes
    Route::apiResource('goals', GoalController::class, ['only' => ['index', 'show', 'store', 'update']]);
});
