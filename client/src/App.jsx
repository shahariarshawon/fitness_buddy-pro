import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile";
import Workouts from "./pages/Workouts";
import Meals from "./pages/Meals";
import Habits from "./pages/Habits";
import Progress from "./pages/Progress";
import Photos from "./pages/Photos";
import Reports from "./pages/Reports";
import Reminders from "./pages/Reminders";
import Today from "./pages/Today";
import Plans from "./pages/Plans";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/today" element={<Today />} />
        <Route path="/plans" element={<Plans />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
