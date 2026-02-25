<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'goal_id',
        'name',
        'description',
        'results',
        'scores',
        'assessment_date',
    ];

    protected $casts = [
        'scores' => 'array',
        'assessment_date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }
}
