<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('doctors', 'consultation_fee')) {
            Schema::table('doctors', function (Blueprint $table) {
                $table->decimal('consultation_fee', 10, 2)->default(1500)->after('rating');
            });
        }

        DB::table('doctors')
            ->whereNull('consultation_fee')
            ->orWhere('consultation_fee', '<=', 0)
            ->update(['consultation_fee' => 1500]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('doctors', 'consultation_fee')) {
            Schema::table('doctors', function (Blueprint $table) {
                $table->dropColumn('consultation_fee');
            });
        }
    }
};
