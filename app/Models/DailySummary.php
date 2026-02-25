<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailySummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'summary_date',
        'total_goals_worked',
        'goals_achieved',
        'total_trials',
        'total_correct',
        'mastery_percentage',
        'notes',
    ];

    protected $casts = [
        'summary_date' => 'date',
        'mastery_percentage' => 'decimal:2',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
