<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'recorded_by',
        'goal_id',
        'iep_id',
        'performance_status',
        'rubric_level',
        'activity',
        'trials_correct',
        'trials_total',
        'is_independent',
        'prompt_level',
        'session_type',
        'include_in_progress',
        'notes',
        'logged_at',
    ];

    protected $casts = [
        'is_independent' => 'boolean',
        'include_in_progress' => 'boolean',
        'logged_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    public function iep()
    {
        return $this->belongsTo(IEP::class);
    }
}
