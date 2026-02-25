<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasteryVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'goal_id',
        'iep_id',
        'required',
        'requires_second_person',
        'verified_by',
        'is_mastered',
        'verified_at',
    ];

    protected $casts = [
        'required' => 'boolean',
        'requires_second_person' => 'boolean',
        'is_mastered' => 'boolean',
        'verified_at' => 'datetime',
        'verified_by' => 'array',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
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
