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
        Schema::table('doctors', function (Blueprint $table) {
            if (! Schema::hasColumn('doctors', 'availability')) {
                $table->string('availability')->nullable()->after('specialty');
            }

            if (! Schema::hasColumn('doctors', 'hospitals')) {
                $table->json('hospitals')->nullable()->after('availability');
            }

            if (! Schema::hasColumn('doctors', 'hospital_schedules')) {
                $table->json('hospital_schedules')->nullable()->after('hospitals');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            if (Schema::hasColumn('doctors', 'hospital_schedules')) {
                $table->dropColumn('hospital_schedules');
            }

            if (Schema::hasColumn('doctors', 'hospitals')) {
                $table->dropColumn('hospitals');
            }

            if (Schema::hasColumn('doctors', 'availability')) {
                $table->dropColumn('availability');
            }
        });
    }
};
