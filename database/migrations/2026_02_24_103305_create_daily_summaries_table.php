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
        Schema::create('daily_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->date('summary_date')->useCurrent();
            $table->integer('total_goals_worked')->default(0);
            $table->integer('goals_achieved')->default(0);
            $table->integer('total_trials')->default(0);
            $table->integer('total_correct')->default(0);
            $table->decimal('mastery_percentage', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('student_id');
            $table->unique(['student_id', 'summary_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_summaries');
    }
};
