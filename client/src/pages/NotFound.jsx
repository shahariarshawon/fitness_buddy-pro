import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  SearchX,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

const NotFound = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#031113] px-4 text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#009587]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#00809d]/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00c2ad]/10 blur-3xl" />

      <div className="relative w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl md:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/25">
          <SearchX size={38} />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-4 py-1.5 text-xs font-semibold text-[#9ff7ec]">
          <Sparkles size={14} />
          Page Not Found
        </div>

        <h1 className="bg-gradient-to-r from-white via-[#9ff7ec] to-[#00c2ad] bg-clip-text text-7xl font-black tracking-tight text-transparent md:text-8xl">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          This page is not available
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
          The page you are looking for may have been moved, removed, or the URL
          might be incorrect. Go back to your fitness dashboard and continue
          tracking your progress.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            <LayoutDashboard size={18} />
            Go Dashboard
          </Link>

          <Link
            to="/today"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <Home size={18} />
            Today Page
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">Track Today</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Meals, workouts, habits, and progress.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">View Reports</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Weekly and monthly progress summary.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">Stay Consistent</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Keep your daily fitness system running.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;