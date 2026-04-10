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
        Schema::table('appointments', function (Blueprint $table) {
            $table->text('consultation_summary')->nullable()->after('status');
            $table->text('consultation_notes')->nullable()->after('consultation_summary');
            $table->timestamp('consulted_at')->nullable()->after('consultation_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['consultation_summary', 'consultation_notes', 'consulted_at']);
        });
    }
};