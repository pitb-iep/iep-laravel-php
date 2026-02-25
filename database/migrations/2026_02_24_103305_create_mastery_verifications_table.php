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
        Schema::create('mastery_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('goal_id')->constrained('goals')->onDelete('cascade');
            $table->foreignId('iep_id')->nullable()->constrained('ieps')->onDelete('cascade');
            $table->boolean('required')->default(false);
            $table->boolean('requires_second_person')->default(true);
            $table->json('verified_by')->nullable();
            $table->boolean('is_mastered')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->index('student_id');
            $table->index('goal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mastery_verifications');
    }
};
