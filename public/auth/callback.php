<?php
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

use Firebase\JWT\JWT;

$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->load();

// ── CSRF state check ──────────────────────────────────────────────────────────
$receivedState = $_GET['state'] ?? '';
$storedState   = $_COOKIE['oauth_state'] ?? '';

if ($receivedState === '' || !hash_equals($storedState, $receivedState)) {
    http_response_code(403);
    exit('OAuth state mismatch. Possible CSRF attempt.');
}

// Clear the one-time state cookie
setcookie('oauth_state', '', time() - 3600, '/', '', false, true);

// ── Exchange code for token ───────────────────────────────────────────────────
$code = $_GET['code'] ?? '';
if ($code === '') {
    http_response_code(400);
    exit('Missing authorization code.');
}

$provider = new League\OAuth2\Client\Provider\Google([
    'clientId'     => $_ENV['GOOGLE_CLIENT_ID'],
    'clientSecret' => $_ENV['GOOGLE_CLIENT_SECRET'],
    'redirectUri'  => $_ENV['GOOGLE_REDIRECT_URI'],
]);

try {
    $accessToken  = $provider->getAccessToken('authorization_code', ['code' => $code]);
    $googleUser   = $provider->getResourceOwner($accessToken);
} catch (\Throwable $e) {
    http_response_code(502);
    exit('Failed to retrieve user from Google: ' . htmlspecialchars($e->getMessage()));
}

// ── Issue JWT ─────────────────────────────────────────────────────────────────
$now     = time();
$payload = [
    'iss'     => 'silip',
    'iat'     => $now,
    'exp'     => $now + 3600 * 8,          // 8-hour session
    'sub'     => $googleUser->getId(),
    'email'   => $googleUser->getEmail(),
    'name'    => $googleUser->getName(),
    'picture' => $googleUser->getAvatar(),
];

$jwt = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');

// Track login — insert new user or update last_login_at
require_once dirname(__DIR__, 2) . '/src/login-tracker.php';
silip_track_login($googleUser->getName(), $googleUser->getEmail());

setcookie('silip_jwt', $jwt, [
    'expires'  => $now + 3600 * 8,
    'path'     => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    // 'secure' => true,   // uncomment when serving over HTTPS
]);

// Redirect to the main app
header('Location: /SILIP/public/');
exit;