<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'full_name',
        'email',
        'password',
        'role',
        'force_password_change',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'force_password_change' => 'boolean',
        ];
    }

    // Relationships
    public function studentsAsTeacher()
    {
        return $this->hasMany(Student::class, 'teacher_id');
    }

    public function studentsAsParent()
    {
        return $this->belongsToMany(Student::class, 'student_user');
    }

    public function logs()
    {
        return $this->hasMany(Log::class, 'recorded_by');
    }

    public function ieps()
    {
        return $this->hasMany(IEP::class, 'created_by');
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class, 'recorded_by');
    }
}

