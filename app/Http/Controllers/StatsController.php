<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use App\Models\IEP;
use App\Models\Log;
use App\Models\Assessment;
use App\Models\Goal;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    /**
     * GET /api/stats/public
     * Get public platform statistics
     * @access Public (no authentication required)
     */
    public function public()
    {
        try {
            $data = [
                'totalStudents' => Student::where('is_active', true)->count(),
                'totalTeachers' => User::where('role', 'Teacher')->count(),
                'totalIEPs' => IEP::count(),
                'totalProgressLogs' => Log::count(),
                'totalAssessments' => Assessment::count(),
                'totalGoals' => Goal::count(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
