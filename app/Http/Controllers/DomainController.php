<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\SubSkill;
use App\Models\Goal;
use Illuminate\Http\Request;

class DomainController extends Controller
{
    /**
     * GET /api/domains
     * Returns the full Goal Bank hierarchy: Domains → SubSkills → Goals
     */
    public function index()
    {
        try {
            $domains = Domain::orderBy('sequence')->orderBy('name')->get();
            
            $data = $domains->map(function ($domain) {
                $subSkills = SubSkill::where('domain_id', $domain->id)
                    ->orderBy('sequence')
                    ->orderBy('name')
                    ->get();
                
                $nestedSubs = $subSkills->map(function ($subSkill) {
                    $goals = Goal::where('sub_skill_id', $subSkill->id)
                        ->orderBy('code')
                        ->get();
                    
                    return [
                        'id' => $subSkill->id,
                        'code' => $subSkill->code ?? null,
                        'title' => $subSkill->name,
                        'name' => $subSkill->name,
                        'description' => $subSkill->description,
                        'sequence' => $subSkill->sequence ?? 0,
                        'goals' => $goals->map(function ($goal) {
                            return [
                                'id' => $goal->id,
                                'code' => $goal->code,
                                'title' => $goal->title,
                                'description' => $goal->description,
                                'tier' => $goal->tier,
                                'ageGroup' => $goal->age_group,
                                'age_group' => $goal->age_group,
                                'objectives' => $goal->short_term_objectives ? json_decode($goal->short_term_objectives) : [],
                                'short_term_objectives' => $goal->short_term_objectives ? json_decode($goal->short_term_objectives) : [],
                                'skillType' => $goal->skill_type,
                                'skill_type' => $goal->skill_type,
                                'masteryCriteria' => $goal->mastery_criteria,
                                'mastery_criteria' => $goal->mastery_criteria,
                                'suggestedPromptLevel' => $goal->prompt_level,
                                'promptLevel' => $goal->prompt_level,
                                'prompt_level' => $goal->prompt_level,
                                'measurementType' => $goal->measurement_type,
                                'measurement_type' => $goal->measurement_type,
                                'dataCollectionInterval' => $goal->data_collection_interval,
                                'quickStart' => $goal->quick_start ? json_decode($goal->quick_start) : null,
                            ];
                        })->values(),
                    ];
                });
                
                return [
                    'id' => $domain->id,
                    'code' => $domain->code,
                    'title' => $domain->name,
                    'name' => $domain->name,
                    'icon' => $domain->icon ?? null,
                    'description' => $domain->description,
                    'abbreviation' => $domain->abbreviation,
                    'sequence' => $domain->sequence ?? 0,
                    'order' => $domain->sequence ?? 0,
                    'subSkills' => $nestedSubs->values(),
                ];
            });
            
            return response()->json([
                'success' => true,
                'count' => $data->count(),
                'data' => $data->values(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * GET /api/domains/:id
     * Returns a single domain with its sub-skills and goals
     * Accepts either ID or domain code (e.g., "CLD")
     */
    public function show($id)
    {
        try {
            // Try to find by ID first, then by code
            $domain = is_numeric($id) 
                ? Domain::find($id)
                : Domain::where('code', strtoupper($id))
                    ->orWhere('name', $id)
                    ->first();
            
            if (!$domain) {
                return response()->json([
                    'success' => false,
                    'error' => 'Domain not found',
                ], 404);
            }
            
            $subSkills = SubSkill::where('domain_id', $domain->id)
                ->orderBy('sequence')
                ->orderBy('name')
                ->get();
            
            $nestedSubs = $subSkills->map(function ($subSkill) {
                $goals = Goal::where('sub_skill_id', $subSkill->id)
                    ->orderBy('code')
                    ->get();
                
                return [
                    'id' => $subSkill->id,
                    'code' => $subSkill->code ?? null,
                    'title' => $subSkill->name,
                    'name' => $subSkill->name,
                    'description' => $subSkill->description,
                    'sequence' => $subSkill->sequence ?? 0,
                    'goals' => $goals->map(function ($goal) {
                        return [
                            'id' => $goal->id,
                            'code' => $goal->code,
                            'title' => $goal->title,
                            'description' => $goal->description,
                            'tier' => $goal->tier,
                            'ageGroup' => $goal->age_group,
                            'age_group' => $goal->age_group,
                            'objectives' => $goal->short_term_objectives ? json_decode($goal->short_term_objectives) : [],
                            'short_term_objectives' => $goal->short_term_objectives ? json_decode($goal->short_term_objectives) : [],
                            'skillType' => $goal->skill_type,
                            'skill_type' => $goal->skill_type,
                            'masteryCriteria' => $goal->mastery_criteria,
                            'mastery_criteria' => $goal->mastery_criteria,
                            'suggestedPromptLevel' => $goal->prompt_level,
                            'promptLevel' => $goal->prompt_level,
                            'prompt_level' => $goal->prompt_level,
                            'measurementType' => $goal->measurement_type,
                            'measurement_type' => $goal->measurement_type,
                        ];
                    })->values(),
                ];
            });
            
            $data = [
                'id' => $domain->id,
                'code' => $domain->code,
                'title' => $domain->name,
                'name' => $domain->name,
                'icon' => $domain->icon ?? null,
                'description' => $domain->description,
                'abbreviation' => $domain->abbreviation,
                'sequence' => $domain->sequence ?? 0,
                'order' => $domain->sequence ?? 0,
                'subSkills' => $nestedSubs->values(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
