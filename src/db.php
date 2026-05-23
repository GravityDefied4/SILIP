<?php
/**
 * db.php — Returns a shared PDO instance.
 * Usage: $pdo = silip_db();
 */

function silip_db(): PDO {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    // Bootstrap .env if not already done
    if (!defined('SILIP_BOOTSTRAP_DONE')) {
        define('SILIP_BOOTSTRAP_DONE', true);
        require_once dirname(__DIR__) . '/vendor/autoload.php';
        $dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__));
        $dotenv->load();
    }

    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $port = $_ENV['DB_PORT'] ?? '3306';
    $name = $_ENV['DB_NAME'] ?? 'silip';
    $user = $_ENV['DB_USER'] ?? 'root';
    $pass = $_ENV['DB_PASS'] ?? '';

    // Connect without a database first to create it if needed
    $pdo = new PDO(
        "mysql:host={$host};port={$port};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$name}` 
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `{$name}`");

    // Create table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_login_history (
            id            INT           NOT NULL AUTO_INCREMENT,
            name          VARCHAR(255)  NOT NULL,
            email         VARCHAR(255)  NOT NULL,
            last_login_at DATETIME      NULL,
            created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    return $pdo;
}