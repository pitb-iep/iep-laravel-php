<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BehaviorProtocol extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'name',
        'description',
        'target_behaviors',
        'intervention_strategies',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'target_behaviors' => 'array',
        'intervention_strategies' => 'array',
        'is_active' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
