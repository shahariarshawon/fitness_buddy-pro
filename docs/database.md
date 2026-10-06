# Database Schema & Modeling Reference

## Engine: MongoDB 7.x with Mongoose 9 ODM

Fitness Buddy Pro implements an optimized schema design balancing denormalization for fast analytical aggregations and relational integrity for client-trainer hierarchies.

---

## Core Entities & Relationships

### 1. User
- **Fields**:
  - `name`: String (required, max 80)
  - `email`: String (unique, index, lowercase)
  - `password`: String (bcrypt hashed, `select: false`)
  - `role`: Enum `["user", "trainer", "admin"]` (default: `"user"`)
  - `assignedTrainer`: ObjectId (ref: `User`)
  - `specialties`: `[String]`
  - `bio`: String
  - `currentWeight`, `startingWeight`, `targetWeight`: Number
  - `height`: Number (cm)
  - `dailyTargets`: `{ calories, protein, carbs, fats, waterLiters, sleepHours, steps }`
  - `passwordResetToken`, `passwordResetExpires`: Security tokens
- **Hooks**:
  - `pre('validate')`: Automatically calculates Mifflin-St Jeor BMR, BMI, and maintenance calorie thresholds.
  - `pre('save')`: Hashes passwords with salt cost factor 10.

### 2. Goal
- **Fields**:
  - `user`: ObjectId (ref: `User`, index)
  - `title`: String
  - `type`: Enum `["weight_loss", "muscle_gain", "strength", "endurance", "habit_streak", "custom"]`
  - `startValue`, `currentValue`, `targetValue`: Number
  - `unit`: String (e.g. `kg`, `lbs`, `days`)
  - `priority`: Enum `["low", "medium", "high"]`
  - `status`: Enum `["in_progress", "completed", "paused", "abandoned"]`
  - `milestones`: Subdocument array `[{ title, targetValue, completed, completedAt }]`
- **Virtuals**:
  - `progressPercentage`: Computes completed progress dynamically `((current - start) / (target - start)) * 100`.

### 3. Workout & Exercise
- **Workout**:
  - `user`: ObjectId (ref: `User`, index)
  - `workoutName`: String
  - `workoutType`: Enum `["strength", "cardio", "hybrid", "mobility"]`
  - `date`: Date (indexed with user: `{ user: 1, date: -1 }`)
  - `duration`: Number (minutes)
  - `caloriesBurned`: Number (computed via ACSM MET formula)
  - `exercises`: Array of set logs `[{ exercise, setLogs: [{ reps, weight, rpe, completed }] }]`
- **Exercise**:
  - `name`: String (indexed)
  - `category`: Enum `["strength", "cardio", "bodyweight", "mobility"]`
  - `muscleGroup`: Enum `["chest", "back", "shoulders", "legs", "arms", "core", "full_body"]`
  - `metValue`: Number (metabolic equivalent)
  - `instructions`, `tips`: Text guides

### 4. Progress, Meals & Habits
- **Progress**: Weight, body fat percentage, body measurements, transformation photos.
- **Meal**: Food items, caloric breakdown, macronutrients (Protein, Carbs, Fats).
- **Habit**: Habit title, frequency, completion checklist, unbroken streak calculation.

---

## Indexing Strategy

| Collection | Index Spec | Purpose |
|---|---|---|
| `users` | `{ email: 1 }` (unique) | O(1) login lookup |
| `workouts` | `{ user: 1, date: -1 }` | Fast history feed & range aggregations |
| `goals` | `{ user: 1, status: 1, targetDate: 1 }` | Fast dashboard goal retrieval |
| `exercises` | `{ category: 1, muscleGroup: 1 }` | Filtered exercise catalog queries |
| `habits` | `{ user: 1, isActive: 1 }` | Daily checklist loading |
