<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name');
            $table->date('dob')->nullable();
            $table->string('diagnosis')->default('Pending');
            $table->string('current_level')->default('New');
            $table->enum('program_stream', ['ECE', 'Junior', 'Senior', 'Autism Support', 'General Ed', 'Life Skills'])->default('ECE');
            $table->json('active_therapies')->default('[]');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('teacher_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
