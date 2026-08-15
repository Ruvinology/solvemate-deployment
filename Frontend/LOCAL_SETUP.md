# Running SolveMate locally

Four things run at once: MySQL, the ML service (5000), the backend (8080), the frontend (5173).
Start them in that order — the backend calls the ML service, the frontend calls the backend.

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| JDK | 17 or newer | `java -version` |
| Node.js | 18 or newer | `node -v` |
| Python | 3.11 or newer | `python --version` |
| MySQL | 8.x, running | `mysql --version` |

Spring Boot 4.0.3 is used, so JDK 17 is the floor. Python 3.11+ is required by `numpy 2.3.5`.

---

## 1. Database

```sql
CREATE DATABASE solvemate;
```

That's all — `spring.jpa.hibernate.ddl-auto=update` creates the tables on first boot, and
`DataSeeder` loads the solvent catalog.

---

## 2. ML service — terminal 1

```powershell
cd D:\solvemate-deployment-main\solvemate-deployment-main\ML-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python ml_service.py
```

Runs on <http://localhost:5000>. Verify: <http://localhost:5000/health>

Use `python ml_service.py` on Windows, not gunicorn — gunicorn is Linux-only and is only
used inside the Docker image.

---

## 3. Backend — terminal 2

Spring Boot does **not** read `.env` files. `application.properties` uses `${DB_URL}`,
`${DB_USERNAME}`, `${DB_PASSWORD}` and `${GEMINI_API_KEY}` with no defaults, so all four
must be real environment variables or the app fails to start.

PowerShell — these last only for the current window:

```powershell
cd D:\solvemate-deployment-main\solvemate-deployment-main\Backend

$env:DB_URL="jdbc:mysql://localhost:3306/solvemate?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-mysql-password"
$env:ML_SERVICE_URL="http://localhost:5000"
$env:GEMINI_API_KEY="your-gemini-key"

.\mvnw.cmd spring-boot:run
```

Runs on <http://localhost:8080>. Verify: <http://localhost:8080/api/health>

`GEMINI_API_KEY` must be set to *something* or startup fails on placeholder resolution.
A dummy value boots fine; only the AI Assistant stops working.

To avoid re-typing these every session, set them permanently once:

```powershell
[Environment]::SetEnvironmentVariable("DB_PASSWORD","your-mysql-password","User")
```

Then reopen the terminal.

---

## 4. Frontend — terminal 3

```powershell
cd D:\solvemate-deployment-main\solvemate-deployment-main\Frontend
copy .env.example .env
npm install
npm run build
npm run dev
```

Runs on <http://localhost:5173>.

`npm run build` is optional for running, but it type-checks — run it once after any code
change so TypeScript errors surface before the demo rather than during it.

---

## 5. Check the trial feature

1. Open <http://localhost:5173> and **register a new account**.
2. Log in. The sidebar shows a gradient pill: `Trial · 14 days left`.
3. Pricing tab → the Free card is green, badged **Your plan**, showing `Day 1 of 14`.
4. Click **View trial status →** for the countdown ring and upgrade options.
5. Click **Upgrade to Pro** → confirmation modal → **Confirm upgrade to Pro**.

The countdown reads from the account's `createdAt` in the database, delivered by
`POST /api/users/login` and stored with the user in `localStorage`.

**If you were already logged in before this change**, log out and back in — `createdAt`
only enters `localStorage` at login, and a stale session falls back to an inferred date.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Backend exits with `Could not resolve placeholder 'DB_URL'` | Env vars not set in *this* terminal |
| `Access denied for user 'root'` | Wrong `DB_PASSWORD`, or MySQL not running |
| Compatibility analysis returns 500 | ML service not running on 5000 |
| Trial always reads Day 1 | Old session — log out and back in |
| Frontend calls the wrong host | `Frontend/.env` missing; `VITE_API_BASE_URL` must be `http://localhost:8080/api` |
| Vite env change ignored | Restart `npm run dev`; Vite reads `.env` only at startup |
