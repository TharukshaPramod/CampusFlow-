<div align="center">

# 🏫 CampusFlow

### Smart Campus Management Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Ollama](https://img.shields.io/badge/Ollama-Llama%203-000000?logo=meta&logoColor=white)](https://ollama.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**CampusFlow** is a full-stack university campus management platform designed to streamline facility bookings, incident reporting, resource management, and real-time notifications — all powered by a local AI assistant via **Ollama (Llama 3)**.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Docs](#-api-documentation) · [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎓 Core Modules

| Module | Description |
|--------|-------------|
| **🔐 Authentication & Authorization** | JWT-based auth with Google OAuth2 SSO, role-based access control (Student, Admin, Technician), email verification, and password reset flows. |
| **📚 Resource Management** | Full CRUD for campus resources with categorized resource types, advanced filtering, and admin analytics dashboards. |
| **📅 Booking Management** | Reserve campus facilities with date/time slot selection, booking status workflows (Pending → Approved → Completed), and admin oversight. |
| **🎫 Incident Ticketing** | Report campus issues with file attachments, threaded comments with role-based badges, status tracking, and category/priority management. |
| **🔔 Real-Time Notifications** | WebSocket-powered live notifications for booking updates, incident status changes, and system announcements. |
| **📊 Admin Dashboard** | Comprehensive analytics with interactive charts (Recharts), user management, and full administrative control over all modules. |

### 🤖 AI-Powered Features (Ollama + Llama 3)

| Feature | Description |
|---------|-------------|
| **🧠 Smart Triage** | Automatically suggests incident category & priority based on title and description using AI analysis. |
| **🔧 Resolution Assistant** | Generates step-by-step resolution guides for technicians with estimated completion times. |
| **📝 Thread Summarizer** | AI-powered summarization of incident comment threads with sentiment analysis. |
| **💬 CampusBot** | A global AI chatbot assistant accessible from any page, answering questions about university facilities, bookings, and incident reporting. |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Java 17** | Core language |
| **Spring Boot 3.5** | Application framework |
| **Spring Security** | Authentication & authorization |
| **Spring Data JPA (Hibernate 6)** | ORM & database access |
| **Spring WebSocket (STOMP)** | Real-time messaging |
| **PostgreSQL 17** (Supabase) | Primary database |
| **Redis** | Caching & session management |
| **MapStruct** | DTO ↔ Entity mapping |
| **Lombok** | Boilerplate reduction |
| **SpringDoc OpenAPI 2.7** | Auto-generated API docs |
| **Flyway** | Database migrations |
| **Ollama (Llama 3)** | Local AI inference |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **TypeScript 5.7** | Type safety |
| **Vite 6** | Build tooling & dev server |
| **Tailwind CSS 3.4** | Utility-first styling |
| **React Router 6** | Client-side routing |
| **Redux Toolkit** | Global state management |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Data visualization & charts |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |
| **Zod** | Schema validation |
| **Socket.IO Client** | WebSocket communication |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker & Docker Compose** | Containerized development |
| **Supabase** | Managed PostgreSQL hosting |
| **Ollama** | Local LLM model server |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Git | 2.40+ | ✅ |
| Java (JDK) | 17+ | ✅ |
| Node.js | 20 LTS | ✅ |
| Maven | 3.9+ (bundled via `mvnw`) | ✅ |
| Docker Desktop | 4+ | ⚡ Recommended |
| Ollama | Latest | ✅ (for AI features) |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/TharukshaPramod/CampusFlow-.git
cd CampusFlow
```

### 2️⃣ Set Up Environment Variables

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
Copy-Item backend/campusflow/.env.example backend/campusflow/.env
Copy-Item frontend/.env.example frontend/.env
```

**macOS / Linux:**
```bash
cp .env.example .env
cp backend/campusflow/.env.example backend/campusflow/.env
cp frontend/.env.example frontend/.env
```

> ⚠️ **Important:** Fill in your actual secret values in `backend/campusflow/.env`. Never commit `.env` files to Git.

### 3️⃣ Start Infrastructure Services

```bash
docker compose up -d postgres redis
```

### 4️⃣ Set Up Ollama (AI Features)

```bash
# Install Ollama from https://ollama.com/download
# Then pull the Llama 3 model:
ollama pull llama3
```

Ollama runs in the background automatically after installation. Verify with:
```bash
ollama list
```

### 5️⃣ Start the Backend

```bash
cd backend/campusflow
./mvnw spring-boot:run
```

The backend will start on **http://localhost:8080**

### 6️⃣ Start the Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**

### 7️⃣ Access the Application

| Service | URL |
|---------|-----|
| 🌐 Frontend | [http://localhost:5173](http://localhost:5173) |
| 🔌 Backend API | [http://localhost:8080/api](http://localhost:8080/api) |
| 📖 Swagger UI | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| ❤️ Health Check | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) |

---

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│                    React 18 + TypeScript + Vite                  │
│         Tailwind CSS · Framer Motion · Recharts · Redux         │
└──────────────────────────┬──────────────────────────────────────┘
                           │  REST API / WebSocket (STOMP)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Spring Boot 3.5 Backend                    │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │   Auth    │  │ Resources│  │ Bookings  │  │  Incidents   │  │
│  │  Module   │  │  Module  │  │  Module   │  │   Module     │  │
│  └───────────┘  └──────────┘  └───────────┘  └──────────────┘  │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
│  │Notifica-  │  │   AI     │  │  Reports  │  │    Admin     │  │
│  │  tions    │  │ (Ollama) │  │  Module   │  │   Module     │  │
│  └───────────┘  └──────────┘  └───────────┘  └──────────────┘  │
│                    Spring Security · JPA · WebSocket             │
└────────┬──────────────────┬──────────────────┬──────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────────┐
   │PostgreSQL│      │  Redis   │      │    Ollama     │
   │(Supabase)│      │  Cache   │      │   (Llama 3)  │
   └──────────┘      └──────────┘      └──────────────┘
```

### Project Structure

```
CampusFlow/
├── backend/campusflow/
│   └── src/main/java/com/sliit/campusflow/
│       ├── config/                  # App configuration & seeders
│       ├── common/                  # Shared base entities & utilities
│       └── modules/
│           ├── auth/                # Authentication & user management
│           │   ├── controller/      # REST endpoints
│           │   ├── service/         # Business logic
│           │   ├── repository/      # JPA repositories
│           │   ├── entity/          # Database entities
│           │   ├── dto/             # Data transfer objects
│           │   └── security/        # JWT filters, OAuth2 handlers
│           ├── resources/           # Campus resource management
│           ├── bookings/            # Facility booking system
│           ├── incidents/           # Incident ticketing system
│           ├── notifications/       # Real-time notification engine
│           ├── ai/                  # AI services (Ollama integration)
│           ├── reports/             # Report generation
│           └── admin/               # Admin-specific operations
│
├── frontend/src/
│   ├── components/                  # Reusable UI components
│   │   ├── layout/                  # Navbar, Sidebar, Footer, Layouts
│   │   └── chat/                    # CampusBot AI chatbot widget
│   ├── pages/                       # Route-level page components
│   │   ├── Home/                    # Landing page
│   │   ├── Auth/                    # Login, Register, Verify
│   │   ├── Resources/               # Resource listing & creation
│   │   ├── Bookings/                # Booking management
│   │   ├── Incidents/               # Incident reporting & detail
│   │   ├── Admin/                   # Admin dashboard & management
│   │   ├── Notifications/           # Notification center
│   │   ├── Profile/                 # User profile
│   │   └── Contact/                 # Contact page
│   ├── services/api/                # Axios API service layer
│   ├── context/                     # React context (Auth)
│   ├── hooks/                       # Custom React hooks
│   ├── store/                       # Redux store & slices
│   └── types/                       # TypeScript type definitions
│
├── docker-compose.yml               # Infrastructure services
├── docker-compose.dev.yml           # Full dev stack
├── .github/                         # CI/CD workflows
└── .env.example                     # Environment variable template
```

---

## 📖 API Documentation

Once the backend is running, access the interactive Swagger UI at:

**[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | User registration |
| `POST` | `/api/v1/auth/login` | User login (JWT) |
| `GET`  | `/api/v1/resources` | List all resources |
| `POST` | `/api/v1/bookings` | Create a booking |
| `GET`  | `/api/v1/incidents` | List incidents |
| `POST` | `/api/v1/incidents` | Create an incident |
| `POST` | `/api/v1/ai/triage` | AI Smart Triage |
| `POST` | `/api/v1/ai/resolution` | AI Resolution Assistant |
| `POST` | `/api/v1/ai/summarize` | AI Thread Summarizer |
| `POST` | `/api/v1/ai/chat` | CampusBot Chat |

---

## 🧪 Verification

After setup, verify everything is working:

```bash
# Backend build & test
cd backend/campusflow
./mvnw verify

# Frontend lint & build
cd ../../frontend
npm run lint
npm run build
npm test
```

---

## 🐳 Docker Development (Alternative)

Run the entire stack with a single command:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This brings up:
- 🗄️ **PostgreSQL** — Database
- ⚡ **Redis** — Cache
- ☕ **Backend** — Spring Boot API server
- ⚛️ **Frontend** — Vite dev server

---

## 🔧 Common Issues & Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port already in use** (5432, 6379, 8080, 5173) | Stop conflicting process or change port mapping in config. |
| **Java version errors** | Ensure `java -version` shows 17+. |
| **401 from protected APIs** | Expected when JWT token is missing. Login first. |
| **Frontend can't reach backend** | Verify `VITE_API_BASE_URL` in `.env` and backend is running on 8080. |
| **Ollama `runner terminated` error** | Restart Ollama: Quit from system tray → Relaunch. May indicate low RAM. |
| **`ollama serve` address in use** | Ollama is already running in the background. Use `ollama list` to verify. |

---

## 👥 Team & Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting pull requests.

### Branch Strategy

```
main              ← Production-ready releases
  └── develop     ← Integration branch
       ├── feat/  ← Feature branches
       └── fix/   ← Bug fix branches
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the CampusFlow Team @ SLIIT**

*Sri Lanka Institute of Information Technology — Malabe Campus*

</div>
