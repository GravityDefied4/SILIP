<?php
/**
 * login-tracker.php — Records or updates a user's login entry.
 * Call silip_track_login($name, $email) after a successful OAuth login.
 */

require_once __DIR__ . '/db.php';

function silip_track_login(string $name, string $email): void {
    $pdo = silip_db();

    $stmt = $pdo->prepare("
        INSERT INTO user_login_history (name, email, last_login_at)
        VALUES (:name, :email, NOW())
        ON DUPLICATE KEY UPDATE
            last_login_at = NOW(),
            name          = VALUES(name)
    ");

    $stmt->execute([
        ':name'  => $name,
        ':email' => $email,
    ]);
}