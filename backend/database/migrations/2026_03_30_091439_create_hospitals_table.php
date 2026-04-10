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
        if (!Schema::hasTable('hospitals')) {
            Schema::create('hospitals', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('city');
                $table->string('phone')->nullable();
                $table->string('email')->nullable();
                $table->text('address')->nullable();
                $table->string('registration_number')->nullable();
                $table->integer('total_beds')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        } else {
            Schema::table('hospitals', function (Blueprint $table) {
                if (!Schema::hasColumn('hospitals', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('hospitals', 'city')) {
                    $table->string('city');
                }
                if (!Schema::hasColumn('hospitals', 'phone')) {
                    $table->string('phone')->nullable();
                }
                if (!Schema::hasColumn('hospitals', 'email')) {
                    $table->string('email')->nullable();
                }
                if (!Schema::hasColumn('hospitals', 'address')) {
                    $table->text('address')->nullable();
                }
                if (!Schema::hasColumn('hospitals', 'registration_number')) {
                    $table->string('registration_number')->nullable();
                }
                if (!Schema::hasColumn('hospitals', 'total_beds')) {
                    $table->integer('total_beds')->nullable();
                }
                if (!Schema::hasColumn('hospitals', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hospitals');
    }
};
