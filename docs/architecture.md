# System Architecture & Technical Design

## Overview

**Fitness Buddy Pro** is an enterprise-ready, full-stack fitness and wellness engineering platform designed around Clean Architecture and domain-driven principles.

```
                      ┌─────────────────────────────────────────┐
                      │            Client Layer                 │
                      │  React 19 + Vite 8 + Tailwind CSS 4     │
                      │  Route-level Lazy Loading & PWA Support │
                      └────────────────────┬────────────────────┘
                                           │ HTTPS (Axios)
                                           │ Bearer Tokens & Refresh Rotation
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          API Gateway Layer              │
                      │  Express 5 + Helmet + CORS + Rate Limit │
                      │  Route Versioning (/api/v1/*)           │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Authentication  │             │  Workout Engine  │             │  AI Assistant    │
│  & RBAC Security │             │  & ACSM MET Math │             │  Heuristic/LLM   │
└────────┬─────────┘             └────────┬─────────┘             └────────┬─────────┘
         │                                │                                │
         └────────────────────────────────┼────────────────────────────────┘
                                          │
                                          ▼
                      ┌─────────────────────────────────────────┐
                      │            Service Layer                │
                      │  authService, workoutService,           │
                      │  progressService, aiFitnessService,     │
                      │  goalService, trainerService            │
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │            Data Layer                   │
                      │  MongoDB 7 + Mongoose 9 ODM             │
                      │  Compound Indexes & Virtuals            │
                      └─────────────────────────────────────────┘
```

---

## Architectural Principles

1. **Separation of Concerns (SoC)**: Controllers handle HTTP transport and input sanitation, delegating business logic to isolated domain services.
2. **Standardized Response Envelope**: All API endpoints respond with predictable `{ success, message, data, meta }` payloads.
3. **Defense in Depth**:
   - Helmet security headers
   - Strict rate-limiting (`generalLimiter`, `authLimiter`)
   - Role-Based Access Control (`USER`, `TRAINER`, `ADMIN`) enforced strictly on backend handlers.
4. **Resilient Bootstrapping**: MongoDB connection handler includes connection timeouts and non-crashing status telemetry to avoid unmonitored container failures.
