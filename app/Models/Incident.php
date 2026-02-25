<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'recorded_by',
        'behavior_type',
        'description',
        'severity',
        'response',
        'reported_to_parent',
        'incident_at',
    ];

    protected $casts = [
        'reported_to_parent' => 'boolean',
        'incident_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
