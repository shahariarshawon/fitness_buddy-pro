# API Specification (REST v1)

Base URL: `http://localhost:5000/api/v1` (with backward-compatible `/api` aliases)

All successful JSON responses follow the standardized envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "meta": {}
}
```

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register new user account |
| `POST` | `/login` | Public | Authenticate user & issue access + refresh tokens |
| `POST` | `/refresh` | Public | Issue new access token using valid refresh token |
| `POST` | `/forgot-password` | Public | Request password reset token |
| `POST` | `/reset-password/:token` | Public | Set new password with valid token |
| `GET` | `/me` | Private | Retrieve logged-in profile summary & role |
| `PUT` | `/profile` | Private | Update biometric & target fields |

---

## 2. Workouts (`/api/v1/workouts`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Private | List workouts with pagination & date filtering |
| `POST` | `/` | Private | Log completed workout (auto-computes calories via MET) |
| `GET` | `/today` | Private | Get workouts scheduled or completed today |
| `POST` | `/preview` | Private | Dry-run MET calorie calculation before saving |
| `GET` | `/:id` | Private | Get single workout details |
| `PUT` | `/:id` | Private | Update workout log |
| `DELETE` | `/:id` | Private | Delete workout record |

---

## 3. Goals & Milestones (`/api/v1/goals`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Private | List all goals for logged-in user |
| `POST` | `/` | Private | Create fitness goal with deadline & target |
| `GET` | `/:id` | Private | Retrieve single goal by ID |
| `PUT` | `/:id` | Private | Update goal progress value & auto-complete |
| `DELETE` | `/:id` | Private | Remove goal |
| `PATCH` | `/:id/milestones/:milestoneId` | Private | Toggle milestone completion checkbox |

---

## 4. AI Fitness Assistant (`/api/v1/ai`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/recommendations` | Private | Generate personalized workout split & macros |
| `POST` | `/chat` | Private | Contextual chat with medical guardrail validation |

---

## 5. Trainer Hub (`/api/v1/trainer`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/clients` | Trainer / Admin | Get list of assigned clients & adherence rates |
| `POST` | `/clients/:clientId` | Trainer / Admin | Assign client to logged-in trainer |
| `DELETE` | `/clients/:clientId` | Trainer / Admin | Remove client assignment |
| `GET` | `/clients/:clientId/progress` | Trainer / Admin | Review client workout logs & weight trajectory |

---

## 6. System Telemetry (`/api/v1/health`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Uptime, database connection status, memory, version |
