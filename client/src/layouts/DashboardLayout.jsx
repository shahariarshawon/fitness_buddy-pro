import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  Camera,
  CheckCircle,
  Dumbbell,
  Home,
  LogOut,
  Scale,
  User,
  Utensils,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/workouts", label: "Workouts", icon: Activity },
  { to: "/meals", label: "Meals", icon: Utensils },
  { to: "/habits", label: "Habits", icon: CheckCircle },
  { to: "/progress", label: "Progress", icon: Scale },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/reminders", label: "Reminders", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPage =
    navItems
      .slice()
      .sort((a, b) => b.to.length - a.to.length)
      .find((item) => location.pathname.startsWith(item.to))?.label ||
    "Dashboard";

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#061316] text-white">
      {/* Soft background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-[#009587]/25 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-[#7f265b]/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-[#00809d]/15 blur-3xl" />
      </div>

      <style>
        {`
          @keyframes softSlideUp {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes softFade {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .app-fade-in {
            animation: softFade 0.35s ease-out both;
          }

          .app-slide-up {
            animation: softSlideUp 0.45s ease-out both;
          }

          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-white/10 bg-[#07191d]/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl md:flex">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587] to-[#00809d] shadow-lg shadow-[#009587]/25">
              <Dumbbell size={24} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight">
                Fitness Buddy Pro
              </h1>
              <p className="text-xs text-slate-400">Fitness Tracker</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/20"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-white/15"
                        : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <span>{label}</span>

                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7f265b] text-sm font-bold">
              {userInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400">Active member</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/10 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15 active:scale-[0.98]"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="relative z-10 min-h-screen w-full min-w-0 pb-32 md:ml-72 md:w-[calc(100%-18rem)] md:pb-0">
        {/* Mobile/Desktop Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#061316]/75 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-2xl md:px-6 md:pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 app-fade-in">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#009587] shadow-[0_0_16px_rgba(0,149,135,0.9)]" />
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {currentPage}
                </p>
              </div>

              <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                Welcome back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009587] to-[#00c2ad]">
                  {user?.name || "User"}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300 sm:block">
                Today’s Progress
              </div>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-200 shadow-lg shadow-black/10 transition hover:bg-white/[0.1] active:scale-95"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>

              <button
                onClick={handleLogout}
                className="hidden rounded-2xl border border-red-400/10 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/15 active:scale-[0.98] md:inline-flex"
              >
                Logout
              </button>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-red-400/10 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-200 transition active:scale-95 md:hidden"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="w-full min-w-0 p-4 app-slide-up md:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <div className="rounded-[2rem] border border-white/10 bg-[#07191d]/90 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `group relative flex min-w-[4.9rem] flex-col items-center justify-center rounded-3xl px-3 py-2.5 text-[11px] font-medium transition-all duration-300 active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-br from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/25"
                      : "text-slate-300 hover:bg-white/[0.07]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`mb-1 flex h-7 w-7 items-center justify-center rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-white/15"
                          : "bg-transparent group-hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon size={17} strokeWidth={isActive ? 2.7 : 2.2} />
                    </span>

                    <span className="whitespace-nowrap leading-none">
                      {label}
                    </span>

                    {isActive && (
                      <span className="absolute -top-1 h-1 w-8 rounded-full bg-white/80 shadow-[0_0_14px_rgba(255,255,255,0.8)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;