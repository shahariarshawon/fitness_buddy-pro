import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Dumbbell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Target,
  User,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",

    goal: "fat_loss",
    gender: "",
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    activityLevel: "moderate",
    trainingBackground: "",
    dailyCalorieTarget: "",
    dailyProteinTarget: "",
    dailyWaterTarget: "",
    sleepTarget: "",
    foodMeasurementPreference: "both",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const buildRegisterPayload = () => {
    const payload = { ...formData };

    delete payload.confirmPassword;

    const numericFields = [
      "age",
      "height",
      "currentWeight",
      "targetWeight",
      "dailyCalorieTarget",
      "dailyProteinTarget",
      "dailyWaterTarget",
      "sleepTarget",
    ];

    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") {
        delete payload[key];
      }
    });

    numericFields.forEach((field) => {
      if (payload[field] !== undefined) {
        payload[field] = Number(payload[field]);
      }
    });

    if (payload.currentWeight && !payload.startingWeight) {
      payload.startingWeight = payload.currentWeight;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildRegisterPayload();

      await register(payload);
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061316] px-4 py-10 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-[#009587]/25 blur-3xl" />
        <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-[#00809d]/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-[#00c2ad]/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-56 w-56 rounded-full bg-[#7f265b]/10 blur-3xl" />
      </div>

      <style>
        {`
          @keyframes softSlideUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .register-slide-up {
            animation: softSlideUp 0.45s ease-out both;
          }
        `}
      </style>

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#07191d]/80 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-[0.9fr_1.15fr]">
        {/* Left branding panel */}
        <div className="hidden border-r border-white/10 bg-gradient-to-br from-[#009587]/20 via-[#07191d]/40 to-[#00809d]/20 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587] to-[#00809d] shadow-lg shadow-[#009587]/25">
                <Dumbbell size={24} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Fitness Buddy Pro
                </h1>
                <p className="text-sm text-slate-300">
                  Transformation System
                </p>
              </div>
            </div>

            <h2 className="mb-4 max-w-sm text-4xl font-bold leading-tight tracking-tight">
              Start your fitness journey with a real system.
            </h2>

            <p className="max-w-sm text-sm leading-6 text-slate-300">
              Build your profile, set your targets, and track workouts, meals,
              habits, progress, and transformation reports.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Target size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">Smart targets</p>
                  <p className="text-xs text-slate-400">
                    Calories • Protein • Water • Sleep
                  </p>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <Activity size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">Daily system</p>
                  <p className="text-xs text-slate-400">
                    Workout • Meal • Habit • Progress
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Register form */}
        <div className="register-slide-up max-h-screen overflow-y-auto p-6 sm:p-8 lg:p-10">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587] to-[#00809d] shadow-lg shadow-[#009587]/25">
                <Dumbbell size={24} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Fitness Buddy Pro
                </h1>
                <p className="text-sm text-slate-400">
                  Transformation System
                </p>
              </div>
            </div>
          </div>

          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#00c2ad]">
              Create account
            </p>

            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
              Start your transformation
            </h1>

            <p className="text-sm text-slate-400">
              Create your account now. You can complete your fitness profile now
              or later from the profile page.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic info */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-12 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#009587]/10"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-12 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#009587]/10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-12 py-3.5 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#009587]/10"
                    placeholder="Minimum 6 characters"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-12 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#009587]/10"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>

            {/* Advanced onboarding toggle */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    Quick fitness setup
                  </p>
                  <p className="text-xs text-slate-400">
                    Optional, but helps dashboard and targets work better.
                  </p>
                </div>

                <span className="rounded-2xl bg-gradient-to-r from-[#009587]/20 to-[#00809d]/20 px-3 py-1.5 text-xs font-semibold text-[#9ff7ec]">
                  {showAdvanced ? "Hide" : "Add now"}
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Goal
                    </label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                    >
                      <option value="fat_loss">Fat loss</option>
                      <option value="muscle_gain">Muscle gain</option>
                      <option value="recomposition">Recomposition</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="general_fitness">General fitness</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Activity level
                    </label>
                    <select
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                      <option value="very_active">Very active</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Training background
                    </label>
                    <select
                      name="trainingBackground"
                      value={formData.trainingBackground}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                    >
                      <option value="">Select background</option>
                      <option value="complete_beginner">Complete beginner</option>
                      <option value="former_trainee">Former trainee</option>
                      <option value="currently_training">
                        Currently training
                      </option>
                      <option value="athlete">Athlete</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="1"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="24"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Height, cm
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="1"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="175"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Current weight, kg
                    </label>
                    <input
                      type="number"
                      name="currentWeight"
                      value={formData.currentWeight}
                      onChange={handleChange}
                      min="1"
                      step="0.1"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="85"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Target weight, kg
                    </label>
                    <input
                      type="number"
                      name="targetWeight"
                      value={formData.targetWeight}
                      onChange={handleChange}
                      min="1"
                      step="0.1"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="75"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Daily calories
                    </label>
                    <input
                      type="number"
                      name="dailyCalorieTarget"
                      value={formData.dailyCalorieTarget}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Daily protein, g
                    </label>
                    <input
                      type="number"
                      name="dailyProteinTarget"
                      value={formData.dailyProteinTarget}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="140"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Daily water, litres
                    </label>
                    <input
                      type="number"
                      name="dailyWaterTarget"
                      value={formData.dailyWaterTarget}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Sleep target, hours
                    </label>
                    <input
                      type="number"
                      name="sleepTarget"
                      value={formData.sleepTarget}
                      onChange={handleChange}
                      min="0"
                      max="24"
                      step="0.5"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      placeholder="8"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-slate-300">
                      Food measurement preference
                    </label>
                    <select
                      name="foodMeasurementPreference"
                      value={formData.foodMeasurementPreference}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3.5 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                    >
                      <option value="both">Regular scales + grams</option>
                      <option value="regular_scales">
                        Regular scales only
                      </option>
                      <option value="grams">Grams only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create Account"}

              {!submitting && (
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#00c2ad] transition hover:text-[#8ff7ec]"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;