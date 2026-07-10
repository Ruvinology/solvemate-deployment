# SolveMate Railway deployment

This repository contains three deployable application services:

- `Frontend` — React/Vite, served by Caddy
- `Backend` — Spring Boot API
- `ML-service` — Flask/Gunicorn ML API

It also requires a Railway MySQL database.

## Railway service root directories

Create three services from this same GitHub repository and use these Root Directory values:

- Frontend: `/Frontend`
- Backend: `/Backend`
- ML service: `/ML-service`

## Backend variables

```env
DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
ML_SERVICE_URL=http://ml-service.railway.internal:5000
GEMINI_API_KEY=replace-with-your-real-key
SHOW_SQL=false
FORMAT_SQL=false
```

Add `PORT=8080` to keep the backend port explicit and predictable.

## ML service variables

Name the Railway service `ml-service`, then add:

```env
PORT=5000
```

The trained model `ML-service/solvemate_ml_model.pkl` is included in the repository.

## Frontend variables

Add `PORT=3000`. During initial testing, use the Railway-generated public backend URL:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND.up.railway.app/api
```

After connecting the custom backend domain, change it to:

```env
VITE_API_BASE_URL=https://api.solvemate.xyz/api
```

The frontend must be redeployed after changing this variable because Vite embeds it at build time.

## Public and private services

Public:

- Frontend
- Backend

Private only:

- ML-service
- MySQL
