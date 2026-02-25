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
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('goal_id')->constrained('goals')->onDelete('cascade');
            $table->foreignId('iep_id')->nullable()->constrained('ieps')->onDelete('cascade');
            
            $table->enum('performance_status', ['Achieved', 'Emerging', 'Not Yet'])->nullable();
            $table->integer('rubric_level')->nullable();
            $table->text('activity')->nullable();
            $table->integer('trials_correct')->default(0);
            $table->integer('trials_total')->default(0);
            $table->boolean('is_independent')->default(false);
            $table->string('prompt_level')->nullable();
            
            $table->enum('session_type', ['Teaching', 'Baseline', 'Probe', 'Generalization', 'Maintenance'])->default('Teaching');
            $table->boolean('include_in_progress')->default(true);
            $table->text('notes')->nullable();
            $table->timestamp('logged_at')->useCurrent();
            
            $table->timestamps();
            $table->index('student_id');
            $table->index('goal_id');
            $table->index('iep_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
