<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->cascadeOnDelete();
            $table->text('diagnosis')->nullable();
            $table->text('prescription')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('medications')->nullable();
            $table->text('allergies')->nullable();
            $table->json('vital_signs')->nullable(); // Structured JSON
            $table->text('treatment_plan')->nullable();
            $table->json('lab_results')->nullable(); // Could store file paths or raw data
            $table->text('notes')->nullable();
            $table->enum('status', ['draft', 'finalized'])->default('draft');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['patient_id', 'doctor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};