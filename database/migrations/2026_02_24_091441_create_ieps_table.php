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
        Schema::create('ieps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['Active', 'Draft', 'Archived'])->default('Draft')->index();
            $table->date('start_date')->useCurrent();
            $table->date('end_date')->nullable();
            $table->string('review_period')->default('Quarterly');
            $table->date('next_review_date')->nullable();
            
            // Present Levels
            $table->text('strengths')->nullable();
            $table->text('concerns')->nullable();
            $table->text('impact')->nullable();
            $table->text('academics')->nullable();
            $table->text('functional')->nullable();
            
            // Team Members (JSON)
            $table->json('team_members')->nullable();
            
            // Accommodations
            $table->json('instructional_accommodations')->nullable();
            $table->json('environmental_accommodations')->nullable();
            $table->json('assessment_accommodations')->nullable();
            
            // Transition & ESY
            $table->text('post_secondary_goals')->nullable();
            $table->text('vocational_goals')->nullable();
            $table->boolean('esy_required')->default(false);
            $table->text('esy_justification')->nullable();
            $table->text('teaching_approach')->nullable();
            
            $table->timestamps();
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ieps');
    }
};
