<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'abbreviation',
        'sequence',
    ];

    public function subSkills()
    {
        return $this->hasMany(SubSkill::class);
    }
}
