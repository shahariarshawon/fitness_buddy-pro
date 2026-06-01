# Fitness Buddy Pro

**Fitness Buddy Pro** is a full-stack fitness tracking web application built with the MERN stack. It helps users track workouts, meals, daily habits, body progress, transformation photos, reminders, and fitness reports from one modern dashboard.

The app is designed as a **PWA-ready fitness tracker**, so users can install it on mobile devices from the browser like a normal app.

---

## Live Demo

Frontend:

```text
https://fitnessbuddypro.vercel.app
```

Backend:

```text
https://fitnessbuddyproserver.vercel.app
```

## Screenshots

### Dashboard
<img width="1290" height="6273" alt="dashboard_fbp" src="https://github.com/user-attachments/assets/56329f81-c84e-48f0-b932-07cfb1204069" />


### Workout Tracker
<img width="1290" height="5970" alt="fbp_workout" src="https://github.com/user-attachments/assets/9d65dde3-6cd2-4660-bd74-7af224811d24" />

### Meal & Diet Tracker
<img width="1290" height="7524" alt="mealTracker_fbp" src="https://github.com/user-attachments/assets/8032c7b5-4ecf-452d-bb68-de7707b99d44" />

### Habit Tracker
<img width="1290" height="7791" alt="habitTracker_fbp" src="https://github.com/user-attachments/assets/20ebdb77-461e-4eb9-b1e6-c30308170b1b" />

### Body Prograss Tracker
<img width="1290" height="7473" alt="bodyProgressTracker_fbp" src="https://github.com/user-attachments/assets/d80f29a3-535b-40bc-897f-cf320ccb3cf3" />

### Body Progress Tracker
<img width="1290" height="6102" alt="progressPhotoTracker_fbp" src="https://github.com/user-attachments/assets/3d6746d0-263e-4c81-b339-861b82de194d" />

### Reminders
<img width="1290" height="6243" alt="reminders_fbp" src="https://github.com/user-attachments/assets/8f3bac17-7fdd-4ae6-94a5-0b77adf1fe05" />

### Profile
<img width="1290" height="5925" alt="profile_fbp" src="https://github.com/user-attachments/assets/e59e0c18-a773-4cca-ac7a-d9b693cfb3f2" />

### Reports
<img width="1290" height="9948" alt="reportsTracker_fbp" src="https://github.com/user-attachments/assets/a6878445-0c15-46ea-8d96-c18a7303438c" />

### PWA Install
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/29a53935-71f4-41f7-b2fa-8dc61d29ffdb" />


---

## Project Overview

Fitness Buddy Pro is created for users who want to manage their fitness transformation in one place. The app allows users to:

* Register and login securely
* Track workouts
* Track meals and calories
* Track protein, carbs, and fats
* Track daily habits
* Track body weight and measurements
* Upload progress photos
* View dashboard analytics
* Generate weekly and monthly reports
* Create reminders
* Install the app as a PWA

---

## Main Features

### Authentication

* User registration
* User login
* JWT-based authentication
* Protected routes
* Logout functionality
* Session persistence using localStorage

### Dashboard

* Calories consumed today
* Protein intake today
* Calories burned today
* Current body weight
* Habit completion percentage
* Current streak
* Weight change
* Weekly workout count
* Calories vs burned chart
* Protein intake chart
* Weight trend chart
* Habit consistency chart

### User Profile

* Update name
* Update age
* Update height
* Update gender
* Set fitness goal
* Set activity level
* Set starting weight
* Set target weight
* Set daily calorie target
* Set daily protein target
* Set daily water target
* Set sleep target
* Change password

### Workout Tracker

* Add workout logs
* Add multiple exercises
* Track sets, reps, weight, and rest time
* Track workout duration
* Track cardio duration
* Estimate calories burned
* View workout history
* Delete workout logs
* Use exercise suggestions from Exercise Library

### Meal and Diet Tracker

* Add meal logs
* Add multiple food items
* Track calories
* Track protein
* Track carbs
* Track fats
* Select food suggestions from Food Library
* View daily nutrition summary
* View meal history
* Delete meal logs

### Habit Tracker

* Daily checklist system
* Workout completed
* Cardio completed
* Diet followed
* Water target completed
* Sleep target achieved
* Prayer completed
* Study completed
* Protein target achieved
* Daily completion percentage
* Current streak
* Best streak
* Average completion
* Habit history

### Body Progress Tracker

* Track body weight
* Track waist
* Track chest
* Track arm
* Track thigh
* Track hip
* Track body fat percentage
* View latest progress
* View total weight change
* View body measurement changes
* Delete progress logs

### Progress Photo Upload

* Upload front, side, back, or other progress photos
* Store photos using Cloudinary
* Save photo date
* Save weight with photo
* Save notes
* View photo history
* Delete photos

### Reports

* Weekly report
* Monthly report
* Overview report
* Calories consumed
* Protein intake
* Calories burned
* Calorie balance
* Workout count
* Workout duration
* Habit average
* Weight change
* Waist change
* Body fat change
* Daily breakdown table

### Reminders

* Create workout reminders
* Create water reminders
* Create meal reminders
* Create sleep reminders
* Create habit reminders
* Create custom reminders
* Daily reminders
* Weekly reminders
* Toggle active/inactive
* Delete reminders

### PWA Support

* Web app manifest
* App icons
* Maskable icon
* Favicon
* Service worker
* Auto update support
* Offline-ready structure
* Installable from browser

---

## Tech Stack

### Frontend

* React
* Vite
* React Router DOM
* Axios
* Tailwind CSS
* Lucide React
* Recharts
* Vite PWA Plugin

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token
* bcryptjs
* Multer
* Cloudinary
* CORS
* Helmet
* Morgan
* Express Rate Limit

### Database

* MongoDB Atlas

### Image Storage

* Cloudinary

### Deployment

* Frontend: Vercel
* Backend: Vercel
* Database: MongoDB Atlas
* Media Storage: Cloudinary

---

## Project Structure

```text
fitness-buddy-pro/
├── client/
│   ├── public/
│   │   ├── icons/
│   │   │   ├── icon-192.png
│   │   │   ├── icon-512.png
│   │   │   └── maskable-icon-512.png
│   │   ├── favicon.ico
│   │   └── offline.html
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── PageLoader.jsx
│   │   │       └── SectionLoader.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── AuthProvider.jsx
│   │   │   └── useAuth.js
│   │   │
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Workouts.jsx
│   │   │   ├── Meals.jsx
│   │   │   ├── Habits.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Photos.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Reminders.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── server/
│   ├── api/
│   │   └── index.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── cloudinary.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── workoutController.js
│   │   │   ├── mealController.js
│   │   │   ├── habitController.js
│   │   │   ├── progressController.js
│   │   │   ├── photoController.js
│   │   │   ├── exerciseController.js
│   │   │   ├── foodController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── reportController.js
│   │   │   └── reminderController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   └── rateLimitMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Workout.js
│   │   │   ├── Meal.js
│   │   │   ├── Habit.js
│   │   │   ├── Progress.js
│   │   │   ├── ProgressPhoto.js
│   │   │   ├── Exercise.js
│   │   │   ├── Food.js
│   │   │   └── Reminder.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── workoutRoutes.js
│   │   │   ├── mealRoutes.js
│   │   │   ├── habitRoutes.js
│   │   │   ├── progressRoutes.js
│   │   │   ├── photoRoutes.js
│   │   │   ├── exerciseRoutes.js
│   │   │   ├── foodRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── reminderRoutes.js
│   │   │
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   └── vercel.json
│
├── README.md
└── .gitignore
```

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/fitness-buddy-pro.git
cd fitness-buddy-pro
```

---

## Backend Setup

### 1. Go to server folder

```bash
cd server
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Create `.env` file

Create a `.env` file inside the `server` folder:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_long_jwt_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Run backend locally

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

## Frontend Setup

### 1. Go to client folder

```bash
cd client
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Create `.env` file

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run frontend locally

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## Environment Variables

### Server Environment Variables

| Variable                | Description                        |
| ----------------------- | ---------------------------------- |
| `PORT`                  | Backend port for local development |
| `NODE_ENV`              | Development or production mode     |
| `MONGO_URI`             | MongoDB Atlas connection string    |
| `JWT_SECRET`            | Secret key for JWT authentication  |
| `JWT_EXPIRES_IN`        | JWT expiry time                    |
| `CLIENT_URL`            | Frontend URL for CORS              |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name              |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                 |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret              |

### Client Environment Variables

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |

---

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### User Profile

```text
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/change-password
```

### Workouts

```text
POST   /api/workouts
GET    /api/workouts
GET    /api/workouts/:id
PUT    /api/workouts/:id
DELETE /api/workouts/:id
```

### Meals

```text
POST   /api/meals
GET    /api/meals
GET    /api/meals/:id
PUT    /api/meals/:id
DELETE /api/meals/:id
GET    /api/meals/summary/daily
```

### Habits

```text
POST   /api/habits
GET    /api/habits
GET    /api/habits/today
GET    /api/habits/summary
GET    /api/habits/:id
PUT    /api/habits/:id
DELETE /api/habits/:id
```

### Body Progress

```text
POST   /api/progress
GET    /api/progress
GET    /api/progress/latest
GET    /api/progress/summary
GET    /api/progress/:id
PUT    /api/progress/:id
DELETE /api/progress/:id
```

### Progress Photos

```text
POST   /api/photos
GET    /api/photos
GET    /api/photos/:id
PUT    /api/photos/:id
DELETE /api/photos/:id
```

### Exercise Library

```text
POST   /api/exercises
GET    /api/exercises
GET    /api/exercises/:id
PUT    /api/exercises/:id
DELETE /api/exercises/:id
```

### Food Library

```text
POST   /api/foods
GET    /api/foods
GET    /api/foods/:id
PUT    /api/foods/:id
DELETE /api/foods/:id
```

### Dashboard

```text
GET /api/dashboard/summary
```

### Reports

```text
GET /api/reports/weekly
GET /api/reports/monthly
GET /api/reports/overview
```

### Reminders

```text
POST   /api/reminders
GET    /api/reminders
GET    /api/reminders/active
GET    /api/reminders/:id
PUT    /api/reminders/:id
PATCH  /api/reminders/:id/toggle
DELETE /api/reminders/:id
```

---

## Authentication Flow

1. User registers or logs in.
2. Backend returns a JWT token.
3. Frontend stores token in `localStorage`.
4. Axios interceptor attaches token to protected API requests.
5. Backend verifies token using JWT middleware.
6. Protected routes return user-specific data only.

Example header:

```text
Authorization: Bearer your_jwt_token
```

---

## PWA Setup

Fitness Buddy Pro includes PWA support using:

```text
vite-plugin-pwa
```

PWA files:

```text
client/public/icons/icon-192.png
client/public/icons/icon-512.png
client/public/icons/maskable-icon-512.png
client/public/favicon.ico
client/public/offline.html
```

PWA features:

* App manifest
* Service worker
* Installable app
* Offline fallback page
* Mobile home screen icon
* Theme color
* Auto update service worker

To build and preview PWA:

```bash
npm run build
npm run preview
```

---

## Deployment

### Frontend Deployment on Vercel

Frontend project settings:

```text
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Frontend environment variable:

```env
VITE_API_URL=https://fitnessbuddyproserver.vercel.app/api
```

Client `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

---

### Backend Deployment on Vercel

Backend project settings:

```text
Root Directory: server
Install Command: npm install
```

Backend environment variables:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://fitnessbuddypro.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Server `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

Serverless entry file:

```text
server/api/index.js
```

Example:

```js
const dotenv = require("dotenv");

dotenv.config();

const app = require("../src/app");
const connectDB = require("../src/config/db");

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  return app(req, res);
};
```

---

## Security Features

The backend includes:

* JWT authentication
* Password hashing with bcryptjs
* Protected API routes
* User-specific data access
* Helmet security headers
* CORS control
* Rate limiting
* Error handling middleware
* File type validation for photo uploads
* Upload size limit
* Environment variable protection

---

## CORS Setup

The backend allows requests from the frontend domain:

```env
CLIENT_URL=https://fitnessbuddypro.vercel.app
```

For local development:

```env
CLIENT_URL=http://localhost:5173
```

If CORS error occurs after deployment, make sure:

* Backend `CLIENT_URL` is set correctly in Vercel
* Backend is redeployed after changing environment variables
* Frontend `VITE_API_URL` points to deployed backend URL
* Backend CORS middleware runs before API routes

---

## Useful Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

---

## Testing Checklist

### Backend

* Register API works
* Login API works
* Protected route works
* MongoDB connects
* Workout API works
* Meal API works
* Habit API works
* Progress API works
* Photo upload works
* Dashboard API works
* Reports API works
* Reminders API works

### Frontend

* Register page works
* Login page works
* Dashboard loads
* Profile update works
* Workout page works
* Meal page works
* Habit tracker works
* Body progress page works
* Photo upload works
* Reports page works
* Reminders page works
* Logout works
* App refresh keeps login session
* PWA install option appears

---

## Future Improvements

Possible future features:

* Real push notifications
* Offline data sync
* Admin dashboard
* Exercise seed database
* Food seed database
* AI meal suggestions
* AI workout planning
* PDF report export
* Progress photo comparison slider
* Dark/light theme toggle
* Mobile app version using React Native
* Social sharing
* Trainer-client account system
* Subscription system
* Google login
* Email verification
* Password reset system

---

## Known Limitations

* Offline mode is basic in the current version.
* Creating new workouts, meals, photos, and progress logs requires internet.
* Nutrition values are practical estimates, not medical-grade nutrition data.
* Progress photo upload depends on Cloudinary.
* Real browser notifications are not fully implemented yet.

---

## App Name

```text
Fitness Buddy Pro
```

Tagline idea:

```text
Track your fitness. Build your routine. See your progress.
```

---

## License

This project is for educational and personal development purposes. You can modify and extend it based on your needs.

---

## Author

Developed by:

```text
Al Shahariar Arafat Shawon
```

Project:

```text
Fitness Buddy Pro
```
