# Fitness Buddy Pro — Frontend Web Client

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ESLint](https://img.shields.io/badge/ESLint-Clean-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)

The frontend client for **Fitness Buddy Pro**, an engineering-grade, high-performance personal fitness and wellness tracking single-page progressive web application (PWA).

---

## Highlights

- **Modern Aesthetic**: Apple Fitness / Nike Training-inspired glassmorphism with dark obsidian surfaces and vivid electric teal accents.
- **Route-Level Code Splitting**: Powered by `React.lazy` and `Suspense`, reducing the initial production bundle down to under 100 kB gzipped with sub-800ms load times.
- **Atomic UI Design System**: Reusable primitives in `src/components/ui/` (`Button`, `Card`, `Badge`, `Input`, `Modal`, `Tabs`, `StatCard`).
- **Interactive Exercise Library**: Instant biomechanical exercise guides and MET multiplier details.
- **Evidence-Based AI Coach UI**: Contextual recommendations and form tips with built-in medical safety notices.
- **PWA Ready**: Offline precaching and installability via `vite-plugin-pwa`.

---

## Directory Structure

```
client/src/
├── components/
│   ├── common/         # PageLoader and global layout helpers
│   └── ui/             # Core reusable design system primitives
├── context/            # AuthContext & useAuth session provider
├── layouts/            # DashboardLayout shell with responsive sidebar & nav
├── pages/              # 18 modular lazy-loaded route pages
│   ├── Landing.jsx     # High-converting public marketing landing page
│   ├── Dashboard.jsx   # Telemetry charts and metrics overview
│   ├── ExerciseLibrary.jsx # Filterable movement database
│   ├── AIAssistant.jsx # AI coaching and recommendations
│   ├── Goals.jsx       # Milestone and deadline tracking
│   ├── TrainerDashboard.jsx # Client roster and adherence
│   ├── Workouts.jsx    # Session logging with ACSM MET calories
│   ├── Meals.jsx       # Macronutrient tracking
│   ├── Habits.jsx      # Streak consistency engine
│   └── ...
├── routes/             # ProtectedRoute guards
└── services/           # Axios API client with token interceptors
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

Server boots on `http://localhost:5173`.

---

## Quality & Build Commands

```bash
# Verify ESLint rules
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
