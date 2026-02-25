<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function index($studentId)
    {
        try {
            $logs = Log::where('student_id', $studentId)
                ->with(['goal:id,title', 'recordedBy:id,name', 'student:id,name'])
                ->orderBy('logged_at', 'desc')
                ->get();

            return response()->json(['success' => true, 'count' => $logs->count(), 'data' => $logs], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function store(Request $request, $studentId)
    {
        try {
            $validated = $request->validate([
                'goal_id' => 'required|exists:goals,id',
                'iep_id' => 'sometimes|exists:ieps,id',
                'performance_status' => 'sometimes|in:Achieved,Emerging,Not Yet',
                'rubric_level' => 'sometimes|integer|min:1|max:5',
                'activity' => 'sometimes|string',
                'trials_correct' => 'sometimes|integer|min:0',
                'trials_total' => 'sometimes|integer|min:0',
                'is_independent' => 'sometimes|boolean',
                'prompt_level' => 'sometimes|string',
                'session_type' => 'sometimes|in:Teaching,Baseline,Probe,Generalization,Maintenance',
                'include_in_progress' => 'sometimes|boolean',
                'notes' => 'sometimes|string',
            ]);

            $logData = array_merge($validated, [
                'student_id' => $studentId,
                'recorded_by' => auth('api')->id(),
            ]);

            $log = Log::create($logData);

            return response()->json(['success' => true, 'data' => $log->load('goal', 'recordedBy')], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function show($id)
    {
        try {
            $log = Log::with(['goal', 'recordedBy', 'student', 'iep'])->find($id);

            if (!$log) {
                return response()->json(['success' => false, 'error' => 'Log not found'], 404);
            }

            return response()->json(['success' => true, 'data' => $log], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
