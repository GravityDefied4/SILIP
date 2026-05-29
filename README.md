# SILIP

**SILIP** is a web-based dashboard for browsing and filtering flood control projects across the Philippines, built with PHP, HTML, CSS, and JavaScript. Users authenticate via Google OAuth, and the app tracks login history in a MySQL database.

---

## Tech Stack

- **PHP** (no framework) — server-side routing, auth, and API endpoints
- **MySQL** — stores user login history (auto-created on first run)
- **Composer** — dependency management
- **Google OAuth 2.0 + JWT** — authentication (`league/oauth2-google`, `firebase/php-jwt`)
- **PSGC API** — Philippine Standard Geographic Code data (`rootscratch/psgc`)
- **Vanilla JS / HTML / CSS** — frontend

---

## Requirements

- PHP 8.0 or higher
- Composer
- MySQL 5.7+ or MariaDB
- A local web server (e.g. XAMPP, Laragon, or Apache) with the project served under `/SILIP/`
- A Google Cloud project with OAuth 2.0 credentials configured

---

## Installation and Setup

### 1. Clone the repository
 
```bash
git clone <repo-url>
cd SILIP
```

### 2. Install dependencies
 
```bash
composer install
```

### 3. Configure environment variables
 
Copy the example below into a file named `.env` in the project root (the same folder as `composer.json`):
 
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost/SILIP/public/auth/callback
 
JWT_SECRET=replace-with-a-long-random-string-at-least-32-chars

DB_HOST=localhost
DB_PORT=3306
DB_NAME=silip
DB_USER=root
DB_PASS=your-database-password
```
 
**Notes:**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Get these from https://console.cloud.google.com/ → APIs & Services → Credentials
- `GOOGLE_REDIRECT_URI` must exactly match the authorized redirect URI you set in the Google Cloud Console.
- `JWT_SECRET` can be any long random string. You can generate one with: `openssl rand -hex 32`
- The `silip` database and the `user_login_history` table are **created automatically** on first run — you don't need to set them up manually.
- Leave `DB_PASS` empty if your local MySQL root user has no password.


### 4. Set up Google OAuth
 
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use an existing one).
3. Navigate to **APIs & Services → Credentials**.
4. Click **Create Credentials → OAuth 2.0 Client ID**.
5. Set the application type to **Web application**.
6. Under **Authorized redirect URIs**, add: `http://localhost/SILIP/public/auth/callback`
7. Copy the **Client ID** and **Client Secret** into your `.env` file.


### 5. Serve the project
 
Place the project folder inside your web server's root (e.g. `htdocs/` for XAMPP) so it is accessible at:
 
```
http://localhost/SILIP/public/
```
 
Make sure `mod_rewrite` is enabled if you are using Apache (the `.htaccess` file in `public/` requires it).

---

## Project Structure
 
```
SILIP/
├── composer.json          # Dependency definitions
├── .env                   # Environment variables (not committed to git)
├── data/
│   ├── raw/               # Source parquet files (politicians, political parties)
│   └── processed/         # Processed JSON data
├── public/                # Web root
│   ├── index.html         # Landing page
│   ├── main.php           # Main dashboard (requires login)
│   ├── script.js          # Frontend logic
│   ├── style.css / main.css
│   ├── auth/
│   │   ├── login.php      # Initiates Google OAuth flow
│   │   ├── callback.php   # Handles OAuth callback, issues JWT cookie
│   │   ├── logout.php     # Clears JWT cookie
│   │   └── user-bar.php   # Renders the logged-in user header
│   ├── api/
│   │   ├── flood-control.php  # Flood control project data endpoint
│   │   └── psgc.php           # PSGC region/province/municipality endpoint
│   └── images/
├── src/
│   ├── auth.php           # JWT authentication middleware
│   ├── db.php             # PDO database connection (auto-creates DB & table)
│   ├── login-tracker.php  # Records user login history
│   ├── politics.php       # Politicians/parties data helper (not integrated yet, as of 05/28/2026)
│   └── Services/
│       └── FloodControlService.php  # Flood control projects data helpe/retriever
└── vendor/                # Composer-managed dependencies
```

---

## Developers

SILIP was developed by SENTINEL.