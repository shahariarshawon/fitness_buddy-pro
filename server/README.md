# Fitness Buddy Pro — Backend API Server

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express 5](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing%20(14%2F14)-success)](https://nodejs.org/api/test.html)

Enterprise REST API backend for **Fitness Buddy Pro**, built following Clean Architecture, strict input validation, and role-based access control (RBAC).

---

## Architectural Highlights

- **REST API Versioning**: Modern `/api/v1/*` endpoints with backward-compatible aliases.
- **Service Layer Pattern**: Business logic decoupled from controllers into `src/services/` (`authService`, `workoutService`, `progressService`, `aiFitnessService`, `goalService`, `trainerService`).
- **Role-Based Authorization (RBAC)**: Enforced via `protect` and `authorize('USER', 'TRAINER', 'ADMIN')` middleware.
- **Security Hardened**: Helmet security headers, `express-rate-limit`, password hashing with `bcryptjs`, and refresh token rotation.
- **ACSM MET Formula**: Scientific energy expenditure calculation based on exercise category, duration, and body mass:
  $$\text{Calories Burned} = \frac{\text{MET} \times 3.5 \times \text{Weight (kg)} \times \text{Duration (min)}}{200}$$
- **Mifflin-St Jeor Engine**: Basal metabolic rate (BMR) and maintenance calorie calculations.
- **Automated Tests**: Built-in `node:test` suite covering health checks, auth cryptography, workout math, and AI guardrails.

---

## Directory Structure

```
server/src/
├── config/        # Resilient MongoDB connection & telemetry status
├── controllers/   # Transport layer request handlers
├── middleware/    # Auth, RBAC, Rate Limiting, Error handling, Multer
├── models/        # Mongoose 9 models with compound indexes
│   ├── User.js, Goal.js, Workout.js, Exercise.js, Meal.js, Habit.js, ...
├── routes/        # Versioned route declarations
├── services/      # Domain business logic & external integrations
├── utils/         # Standardized API response format & token generation
└── server.js      # Application entrypoint
server/tests/      # Automated integration & unit tests
```

---

## API Quick Reference

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/v1/health` | GET | Public | Uptime, database status, memory telemetry |
| `/api/v1/auth/register` | POST | Public | Register new user |
| `/api/v1/auth/login` | POST | Public | Login with credentials |
| `/api/v1/auth/refresh` | POST | Public | Refresh expired access token |
| `/api/v1/workouts` | GET/POST | User | Manage session logs |
| `/api/v1/exercises` | GET | User | Search exercise library |
| `/api/v1/goals` | GET/POST | User | Track quantifiable goals & milestones |
| `/api/v1/ai/recommendations` | GET | User | AI generated training splits & macros |
| `/api/v1/ai/chat` | POST | User | AI coaching chat with medical filters |
| `/api/v1/trainer/clients` | GET/POST | Trainer | Review client roster and adherence |

---

## Development & Testing

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run automated tests
npm test

# Launch in development mode
npm run dev
```
