<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Goal::with('subSkill');

            if ($request->has('tier')) {
                $query->where('tier', $request->input('tier'));
            }

            if ($request->has('skill_type')) {
                $query->where('skill_type', $request->input('skill_type'));
            }

            if ($request->has('sub_skill_id')) {
                $query->where('sub_skill_id', $request->input('sub_skill_id'));
            }

            $goals = $query->get();

            return response()->json(['success' => true, 'count' => $goals->count(), 'data' => $goals], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function show($id)
    {
        try {
            $goal = Goal::with('subSkill')->find($id);

            if (!$goal) {
                return response()->json(['success' => false, 'error' => 'Goal not found'], 404);
            }

            return response()->json(['success' => true, 'data' => $goal], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'code' => 'sometimes|unique:goals,code',
                'sub_skill_id' => 'required|exists:sub_skills,id',
                'title' => 'required|string',
                'description' => 'sometimes|string',
                'tier' => 'sometimes|in:A,B,C',
                'age_group' => 'sometimes|string',
                'short_term_objectives' => 'sometimes|array',
                'skill_type' => 'sometimes|string',
                'prompt_level' => 'sometimes|string',
                'mastery_criteria' => 'sometimes|integer',
                'measurement_type' => 'sometimes|string',
                'data_collection_interval' => 'sometimes|integer',
                'quick_start' => 'sometimes|array',
            ]);

            $goal = Goal::create($validated);

            return response()->json(['success' => true, 'data' => $goal], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $goal = Goal::find($id);

            if (!$goal) {
                return response()->json(['success' => false, 'error' => 'Goal not found'], 404);
            }

            $validated = $request->validate([
                'code' => 'sometimes|unique:goals,code,' . $id,
                'title' => 'sometimes|string',
                'description' => 'sometimes|string',
                'tier' => 'sometimes|in:A,B,C',
                'age_group' => 'sometimes|string',
                'short_term_objectives' => 'sometimes|array',
                'skill_type' => 'sometimes|string',
                'prompt_level' => 'sometimes|string',
                'mastery_criteria' => 'sometimes|integer',
                'measurement_type' => 'sometimes|string',
                'data_collection_interval' => 'sometimes|integer',
                'quick_start' => 'sometimes|array',
            ]);

            $goal->update($validated);

            return response()->json(['success' => true, 'data' => $goal], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}
