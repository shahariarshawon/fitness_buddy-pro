# Fitness Buddy Pro

[![CI/CD Pipeline](https://github.com/shahariarshawon/fitness_buddy-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/shahariarshawon/fitness_buddy-pro/actions)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js 22](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Fitness Buddy Pro** is a modern, full-stack fitness and wellness management platform engineered for lifters, athletes, and trainers. Built on Clean Architecture, it delivers science-backed workout planning, ACSM MET-based caloric calculations, automated macronutrient distribution, habit consistency tracking, and an evidence-based AI coaching assistant.

---

## Live Deployments & Demos

- **Frontend Client**: [https://fitnessbuddypro.vercel.app](https://fitnessbuddypro.vercel.app)
- **Backend API**: [https://fitnessbuddyproserver.vercel.app/api/v1/health](https://fitnessbuddyproserver.vercel.app/api/v1/health)

---

## Screenshots

<div align="center">
  <img width="800" alt="Fitness Buddy Pro Dashboard" src="https://github.com/user-attachments/assets/2b2fd1c6-70ca-4538-9dc1-672d093eea81" />
  <p><em>Real-Time Telemetry Dashboard — Volume, Caloric Expenditure, and Habit Consistency</em></p>
</div>

<br />

<div align="center">
  <img width="800" alt="Workout Planning & Tracking" src="https://github.com/user-attachments/assets/e081f035-5597-42d8-b18b-c19f4d3a8f62" />
  <p><em>Exercise Session Tracker with Progressive Overload & Set Breakdown</em></p>
</div>

---

## Core Features

- **Public Conversion Landing Page**: Apple Fitness & Nike Training-inspired high-converting marketing homepage showcasing workflow, live mockups, and feature highlights.
- **Personalized Workout Planner**: Create customized multi-week programs, log sets, reps, weight, RPE, and rest times.
- **ACSM Scientific Caloric Engine**: Accurate calorie expenditure calculations utilizing the American College of Sports Medicine MET formula:
  $$\text{Calories} = \frac{\text{MET} \times 3.5 \times \text{Weight (kg)} \times \text{Duration (min)}}{200}$$
- **Mifflin-St Jeor Metabolic Engine**: Automatic BMR and maintenance calories computed from height, weight, gender, age, and activity coefficient.
- **Searchable Exercise Library**: Biomechanical movement directory filtered by muscle groups, categories, equipment, and difficulty levels.
- **Evidence-Based AI Fitness Assistant**: Contextual workout suggestions, macro breakdowns, and form tips equipped with strict medical safety guardrails.
- **Goal & Milestone Tracking**: Create quantifiable targets (weight cut, hypertrophy, 1RM strength) with visual progress bars and milestone checklists.
- **Trainer Hub & RBAC**: Dedicated dashboard for trainers to review client rosters, log entries, and program adherence.
- **Macronutrient & Hydration Tracking**: Precision daily tracking of protein, carbohydrates, dietary fats, fiber, and water intake.
- **Habit Streaks & Consistency**: Gamified habit streaks to build sustainable, long-term discipline.
- **PWA Ready**: Progressive Web App installable across desktop and mobile devices.

---

## System Architecture

Fitness Buddy Pro is built on decoupled, layer-isolated Clean Architecture principles:

```
[ Frontend: React 19 + Vite 8 + Tailwind CSS 4 ]
    ├── Atomic Design System (Button, Card, Modal, Input, Badge, Tabs, StatCard)
    ├── Route-Level Code Splitting (React.lazy / Suspense)
    └── Offline Precaching (Vite PWA)
                         │
                         ▼ HTTPS (Axios Interceptors / Bearer Tokens)
[ API Gateway & Security ]
    ├── Express 5 REST API Versioning (/api/v1/*)
    ├── Helmet Security Headers & CORS Policy
    ├── Rate Limiting (General & Auth Limiters)
    └── RBAC Authorization Middleware (USER, TRAINER, ADMIN)
                         │
                         ▼
[ Domain Service Layer ]
    ├── authService          (Token generation, password hashing, crypto resets)
    ├── workoutService       (ACSM MET math, session logging, volume aggregations)
    ├── aiFitnessService     (Evidence-based routine generator & safety filters)
    ├── goalService          (Milestone checklists & dynamic percentage math)
    └── trainerService       (Client roster & adherence monitoring)
                         │
                         ▼
[ Data Layer: MongoDB 7 + Mongoose 9 ]
    ├── Compound Indexes ({ user: 1, date: -1 }, { user: 1, status: 1 })
    └── Virtuals & Pre-Validate Lifecycle Hooks (BMR, BMI, Password hashing)
```

For comprehensive architectural breakdowns, read [`docs/architecture.md`](docs/architecture.md).

---

## API Documentation Quick Reference

All endpoints return a standardized enterprise response envelope:

```json
{
  "success": true,
  "message": "Workout logged successfully",
  "data": {
    "workoutName": "Heavy Push Power",
    "duration": 60,
    "caloriesBurned": 385
  }
}
```

### Key Endpoints

| Resource | Method | Path | Role | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | Public | System uptime, database connection status, memory |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | User account registration |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Login & issue access + refresh tokens |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Public | Refresh expired access token |
| **Workouts** | `GET` | `/api/v1/workouts` | User | Get workouts with pagination & date range filter |
| **Workouts** | `POST` | `/api/v1/workouts` | User | Create workout log (auto MET calories) |
| **Exercises** | `GET` | `/api/v1/exercises` | User | Filterable exercise catalog |
| **Goals** | `GET` | `/api/v1/goals` | User | List user goals & milestones |
| **AI Assistant** | `GET` | `/api/v1/ai/recommendations` | User | Get personalized routine & macro split |
| **AI Assistant** | `POST` | `/api/v1/ai/chat` | User | Contextual chat with medical guardrails |
| **Trainer** | `GET` | `/api/v1/trainer/clients` | Trainer | View assigned client roster & adherence |

Detailed specifications: [`docs/api.md`](docs/api.md).

---

## Installation & Setup

### Option 1: Docker Compose (Recommended)

Run the complete multi-container stack with MongoDB, API server, and Nginx client:

```bash
# Clone the repository
git clone https://github.com/shahariarshawon/fitness_buddy-pro.git
cd fitness-buddy-pro

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d --build
```

- Web Client: `http://localhost:8080`
- API Server: `http://localhost:5000`

---

### Option 2: Local Manual Setup

#### Prerequisites
- Node.js 20+ (v22 LTS recommended)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas

#### 1. Backend Server Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

#### 2. Frontend Client Setup
```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```

---

## Testing Discipline

Automated test suites run natively via Node's test runner (`node:test`):

```bash
cd server
npm test
```

### Test Coverage Highlights
- **Health Diagnostics**: Validates API telemetry, database connectivity flags, and uptime.
- **Authentication Security**: Validates JWT signature generation, refresh token verification, and bcrypt hashing uniqueness.
- **Scientific Formulas**: Validates ACSM MET caloric burn and Mifflin-St Jeor BMR calculations against sports science standards.
- **AI Safety Guardrails**: Validates that symptom-trigger keywords (e.g. sharp chest pain) trip defensive safety notices rather than training advice.

---

## Performance & Optimization

- **Bundle Size Optimization**: Route-level code splitting reduced the client bundle from **950 kB down to 304 kB** (99 kB gzipped), with individual pages under 25 kB.
- **Resilient Bootstrapping**: MongoDB connection handler includes connection timeouts and non-crashing status telemetry to avoid unmonitored container failures.
- **Strict ESLint Verification**: Zero lint errors across all client and server files.

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — System design, layers, and security controls.
- [`docs/database.md`](docs/database.md) — Schema modeling, relations, and compound indexes.
- [`docs/api.md`](docs/api.md) — REST API contracts and request/response specifications.
- [`docs/deployment.md`](docs/deployment.md) — Docker, PM2, and cloud hosting guides.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — Contribution guidelines and pull request conventions.

---

## License

This project is licensed under the [MIT License](LICENSE).
