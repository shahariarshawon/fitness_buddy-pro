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
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
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

          .login-slide-up {
            animation: softSlideUp 0.45s ease-out both;
          }
        `}
      </style>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#07191d]/80 shadow-2xl shadow-black/40 backdrop-blur-2xl md:grid-cols-[1fr_1.05fr]">
        {/* Left branding panel */}
        <div className="hidden border-r border-white/10 bg-gradient-to-br from-[#009587]/20 via-[#07191d]/40 to-[#00809d]/20 p-8 md:flex md:flex-col md:justify-between">
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
              Build your body with a smarter daily system.
            </h2>

            <p className="max-w-sm text-sm leading-6 text-slate-300">
              Track workouts, meals, habits, progress photos, and daily targets
              from one clean dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <Activity size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold">Today’s focus</p>
                <p className="text-xs text-slate-400">
                  Workout • Meal • Habit
                </p>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]" />
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="login-slide-up p-6 sm:p-8 md:p-10">
          <div className="mb-8 md:hidden">
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
              Welcome back
            </p>

            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
              Login to your account
            </h1>

            <p className="text-sm text-slate-400">
              Continue tracking your fitness, meals, and transformation plan.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
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
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-12 py-3.5 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#009587]/10"
                  placeholder="Your password"
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

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Login"}

              {!submitting && (
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            New here?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#00c2ad] transition hover:text-[#8ff7ec]"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;