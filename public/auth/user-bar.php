<?php
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
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0;
    margin: 0;
    font-size: 1.4rem;
    color: inherit;
    font-family: inherit;
  }
  #silip-user-bar a {
    color: inherit;
    margin-left: 0;
    text-decoration: none;
  }
  #silip-user-bar a:hover {
    text-decoration: underline;
  }
</style>