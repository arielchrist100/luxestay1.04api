<?php

// database/migrations/xxxx_add_avatar_to_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Ajouter avatar si pas déjà présent
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar', 500)->nullable()->after('email');
            }

            // Ajouter phone si pas déjà présent
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->after('avatar');
            }

            // Ajouter role si pas déjà présent
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'proprietaire', 'client'])
                      ->default('client')
                      ->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'phone', 'role']);
        });
    }
};
