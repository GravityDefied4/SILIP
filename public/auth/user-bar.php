<?php
/**
 * THIS IS JUST TO TEST if the logout works
 * Steps:
 * Login once on localhost/SILIP/public/auth/login.php, then open phpMyAdmin at http://localhost/phpmyadmin
 * Look for a database named silip, click it, then click the user_login_history table, you'll see the record
 * Next, open http://localhost/SILIP/public/auth/user-bar.php, the right-top corner will display the current user
 * Logout and it will redirect to /SILIP/public/
 */
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->load();

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$name = 'Guest';
$token = $_COOKIE['silip_jwt'] ?? '';
if ($token !== '') {
    try {
        $decoded = JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
        $name = $decoded->name;
    } catch (\Throwable $e) {}
}
?>
<style>
  #silip-user-bar {
    margin: 10px;
    position: fixed; top: 0; right: 0;
    background: none;
    padding: 6px 14px; font-size: 13px;
    z-index: 9999; border-bottom-left-radius: 6px;
    font-family: sans-serif;
  }
  #silip-user-bar a { color: #f87171; margin-left: 12px; text-decoration: none; }
  #silip-user-bar a:hover { text-decoration: underline; }
</style>