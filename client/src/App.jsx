import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PageLoader from "./components/common/PageLoader";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Lazy-loaded routes for optimal initial bundle splitting
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workouts = lazy(() => import("./pages/Workouts"));
const ExerciseLibrary = lazy(() => import("./pages/ExerciseLibrary"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Goals = lazy(() => import("./pages/Goals"));
const TrainerDashboard = lazy(() => import("./pages/TrainerDashboard"));
const Meals = lazy(() => import("./pages/Meals"));
const Habits = lazy(() => import("./pages/Habits"));
const Progress = lazy(() => import("./pages/Progress"));
const Photos = lazy(() => import("./pages/Photos"));
const Reports = lazy(() => import("./pages/Reports"));
const Reminders = lazy(() => import("./pages/Reminders"));
const Today = lazy(() => import("./pages/Today"));
const Plans = lazy(() => import("./pages/Plans"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  return (
    <Suspense
      fallback={
        <PageLoader
          title="Loading Fitness Buddy Pro"
          message="Preparing high-performance fitness telemetry..."
        />
      }
    >
      <Routes>
        {/* Public Landing & Marketing */}
        <Route path="/" element={<Landing />} />

        {/* Public Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Dashboard Shell */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
