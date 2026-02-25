<?php

namespace App\Http\Controllers;

use App\Models\IEP;
use Illuminate\Http\Request;

class IepController extends Controller
{
    public function index($studentId)
    {
        try {
            $ieps = IEP::where('student_id', $studentId)
                ->with([
                    'createdBy:id,name,full_name', 
                    'student:id,name,dob,diagnosis,program_stream,current_level,active_therapies',
                    'goals'
                ])
                ->get();

            return response()->json([
                'success' => true,
                'count' => $ieps->count(),
                'data' => $ieps,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function store(Request $request, $studentId)
    {
        try {
            $validated = $request->validate([
                'status' => 'sometimes|in:Active,Draft,Archived',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date',
                'review_period' => 'sometimes|string',
                'next_review_date' => 'sometimes|date',
                'strengths' => 'sometimes|string',
                'concerns' => 'sometimes|string',
                'impact' => 'sometimes|string',
                'team_members' => 'sometimes|array',
            ]);

            $iepData = array_merge($validated, [
                'student_id' => $studentId,
                'created_by' => auth('api')->id(),
            ]);

            // Archive other active IEPs if this is being set to Active
            if (($validated['status'] ?? null) === 'Active') {
                IEP::where('student_id', $studentId)
                    ->where('status', 'Active')
                    ->update(['status' => 'Archived', 'end_date' => now()]);
            }

            $iep = IEP::create($iepData);

            return response()->json(['success' => true, 'data' => $iep->load('createdBy', 'student', 'goals')], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function show($id)
    {
        try {
            $iep = IEP::with([
                'student:id,name,dob,diagnosis,program_stream,current_level,active_therapies', 
                'createdBy:id,name,full_name',
                'goals'
            ])->find($id);

            if (!$iep) {
                return response()->json(['success' => false, 'error' => 'IEP not found'], 404);
            }

            return response()->json(['success' => true, 'data' => $iep], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $iep = IEP::find($id);

            if (!$iep) {
                return response()->json(['success' => false, 'error' => 'IEP not found'], 404);
            }

            $validated = $request->validate([
                'status' => 'sometimes|in:Active,Draft,Archived',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date',
                'review_period' => 'sometimes|string',
                'next_review_date' => 'sometimes|date',
                'strengths' => 'sometimes|string',
                'concerns' => 'sometimes|string',
                'impact' => 'sometimes|string',
                'team_members' => 'sometimes|array',
            ]);

            // Archive other active IEPs if this is being set to Active
            if (($validated['status'] ?? null) === 'Active') {
                IEP::where('student_id', $iep->student_id)
                    ->where('id', '!=', $id)
                    ->where('status', 'Active')
                    ->update(['status' => 'Archived', 'end_date' => now()]);
            }

            $iep->update($validated);

            return response()->json(['success' => true, 'data' => $iep], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
