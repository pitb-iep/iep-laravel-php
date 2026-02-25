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
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->nullable()->index();
            $table->foreignId('sub_skill_id')->constrained('sub_skills')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('tier', ['A', 'B', 'C'])->nullable()->index();
            $table->string('age_group')->nullable();
            $table->json('short_term_objectives')->nullable();
            $table->enum('skill_type', ['Academic', 'Functional', 'Behavioral', 'Social', 'Communication', 'Motor', 'Self-Care'])->nullable();
            $table->string('prompt_level')->nullable();
            $table->integer('mastery_criteria')->nullable();
            $table->string('measurement_type')->nullable();
            $table->integer('data_collection_interval')->nullable();
            $table->json('quick_start')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
