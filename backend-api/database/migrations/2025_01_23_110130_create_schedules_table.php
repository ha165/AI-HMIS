<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->comment('References doctors (users with doctor role)');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->date('start_date')->virtualAs('DATE(start_time)')->comment('Virtual column for date filtering');
            $table->date('end_date')->virtualAs('DATE(end_time)')->comment('Virtual column for date filtering');
            $table->text('notes')->nullable();
            $table->timestamps();
            // Add indexes for performance
            $table->index(['doctor_id', 'start_time']);
            $table->index(['doctor_id', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
