<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IEP extends Model
{
    use HasFactory;

    protected $table = 'ieps';
    
    protected $fillable = [
        'student_id',
        'created_by',
        'status',
        'start_date',
        'end_date',
        'review_period',
        'next_review_date',
        'strengths',
        'concerns',
        'impact',
        'academics',
        'functional',
        'team_members',
        'instructional_accommodations',
        'environmental_accommodations',
        'assessment_accommodations',
        'post_secondary_goals',
        'vocational_goals',
        'esy_required',
        'esy_justification',
        'teaching_approach',
    ];

    protected $casts = [
        'team_members' => 'array',
        'instructional_accommodations' => 'array',
        'environmental_accommodations' => 'array',
        'assessment_accommodations' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'next_review_date' => 'date',
        'esy_required' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logs()
    {
        return $this->hasMany(Log::class);
    }

    public function masteryVerifications()
    {
        return $this->hasMany(MasteryVerification::class);
    }

    /**
     * Get unique goals associated with this IEP through logs
     */
    public function goals()
    {
        return $this->belongsToMany(
            Goal::class,
            'logs',
            'iep_id',
            'goal_id'
        );
    }
}
