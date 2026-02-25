<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'domain_id',
        'name',
        'description',
        'sequence',
    ];

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }
}
