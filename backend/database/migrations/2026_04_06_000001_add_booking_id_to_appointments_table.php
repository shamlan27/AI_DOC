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
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('booking_id')->nullable()->unique()->after('id');
        });

        DB::table('appointments')
            ->orderBy('id')
            ->get()
            ->each(function ($appointment): void {
                $bookingId = sprintf('BK-%s-%04d', now()->format('Ymd'), $appointment->id);

                DB::table('appointments')
                    ->where('id', $appointment->id)
                    ->update(['booking_id' => $bookingId]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropUnique(['booking_id']);
            $table->dropColumn('booking_id');
        });
    }
};
