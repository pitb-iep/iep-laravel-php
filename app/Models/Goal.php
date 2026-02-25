<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'sub_skill_id',
        'title',
        'description',
        'tier',
        'age_group',
        'short_term_objectives',
        'skill_type',
        'prompt_level',
        'mastery_criteria',
        'measurement_type',
        'data_collection_interval',
        'quick_start',
    ];

    protected $casts = [
        'short_term_objectives' => 'array',
        'quick_start' => 'array',
    ];

    public function subSkill()
    {
        return $this->belongsTo(SubSkill::class);
    }

    public function logs()
    {
        return $this->hasMany(Log::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function masteryVerifications()
    {
        return $this->hasMany(MasteryVerification::class);
    }
}
