<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'name',
        'dob',
        'diagnosis',
        'current_level',
        'program_stream',
        'active_therapies',
        'is_active',
    ];

    protected $casts = [
        'active_therapies' => 'array',
        'is_active' => 'boolean',
        'dob' => 'date',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function parents()
    {
        return $this->belongsToMany(User::class, 'student_user');
    }

    public function logs()
    {
        return $this->hasMany(Log::class);
    }

    public function ieps()
    {
        return $this->hasMany(IEP::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function behaviorProtocols()
    {
        return $this->hasMany(BehaviorProtocol::class);
    }

    public function masteryVerifications()
    {
        return $this->hasMany(MasteryVerification::class);
    }

    public function dailySummaries()
    {
        return $this->hasMany(DailySummary::class);
    }

    // Virtual attribute for age calculation
    public function getAgeAttribute()
    {
        if (!$this->dob) {
            return null;
        }
        return $this->dob->diffInYears(today());
    }
}
