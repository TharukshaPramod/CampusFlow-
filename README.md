# CampusFlow

CampusFlow is a smart campus management platform with:
- Backend: Spring Boot 3 (Java 21)
- Frontend: React 18 + TypeScript + Vite + Tailwind
- Infrastructure services: PostgreSQL + Redis

## Tech Requirements

Install these tools before first run:
- Git 2.40+
- Java 21 (JDK)
- Maven 3.9+
- Node.js 20 LTS (npm 10+)
- Docker Desktop 4+ (optional but recommended)

Recommended IDE setup:
- VS Code with Java Extension Pack, ESLint, and Prettier
- IntelliJ IDEA (for backend) also works

## First-Time Setup

1. Clone and enter project
```bash
git clone <your-repo-url>
cd CampusFlow
```

2. Create local environment files from templates

macOS/Linux:
```bash
cp .env.example .env
cp backend/campusflow/.env.example backend/campusflow/.env
cp frontend/.env.example frontend/.env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
Copy-Item backend/campusflow/.env.example backend/campusflow/.env
Copy-Item frontend/.env.example frontend/.env
```

Notes:
- Fill real secret values in `backend/campusflow/.env` for your own environment.
- Never commit any `.env` file to GitHub.

3. Start infrastructure (PostgreSQL + Redis)
```bash
docker compose up -d postgres redis
```

4. Run backend
```bash
cd backend/campusflow
mvn spring-boot:run
```

5. Run frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```

6. Open app
- Frontend: http://localhost:5173
- Backend API base: http://localhost:8080/api

## Alternative: Full Docker Development

Run entire stack from repository root:
```bash
docker compose -f docker-compose.dev.yml up --build
```

This brings up:
- db (PostgreSQL)
- redis
- backend (Spring Boot)
- frontend (Vite dev server)

## Verification Checklist

After setup, verify:
```bash
# Backend build/test
cd backend/campusflow
mvn verify

# Frontend build/lint/test
cd ../../frontend
npm run lint
npm run build
npm test
```

If all commands pass, your laptop is correctly configured.

## Project Structure

- backend: Spring Boot application and modules
- frontend: Vite React client
- .github: CI workflows
- docker-compose.yml: local infra services
- docker-compose.dev.yml: full dev stack

## Common Issues

1. 401 responses from protected APIs
- Expected when endpoint requires authentication and token is missing.

2. Port already in use (5432, 6379, 8080, 5173)
- Stop conflicting service/process or change local port mapping.

3. Java version errors
- Ensure `java -version` shows 21.

4. Frontend cannot reach backend
- Confirm `VITE_API_BASE_URL` in `.env` and backend is running on 8080.

## Team Onboarding Message (Copy/Paste)

Use this in Slack/Teams for new members:

```text
Welcome to CampusFlow.

Laptop setup checklist:
1) Install: Git, Java 21, Maven 3.9+, Node 20 LTS, Docker Desktop.
2) Clone repo and create local env files:
	- `.env` from `.env.example`
	- `backend/campusflow/.env` from `backend/campusflow/.env.example`
	- `frontend/.env` from `frontend/.env.example`
3) Start infra: docker compose up -d postgres redis
4) Start backend: cd backend/campusflow && mvn spring-boot:run
5) Start frontend: cd frontend && npm install && npm run dev
6) Validate: mvn verify, npm run lint, npm run build, npm test

If any step fails, share terminal output in #campusflow-dev-help.
```
