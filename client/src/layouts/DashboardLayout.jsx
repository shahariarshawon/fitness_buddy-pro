import { Link, Outlet, useNavigate } from "react-router-dom";
import { Dumbbell, Home, LogOut, User } from "lucide-react";
import { useAuth } from "../context/useAuth"; 

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed left-0 top-0 hidden md:flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <Dumbbell size={22} />
          </div>
          <div>
            <h1 className="font-bold text-lg">KynoraFit</h1>
            <p className="text-xs text-slate-400">Fitness Tracker</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-3 bg-slate-800 text-white"
          >
            <Home size={18} />
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <User size={18} />
            Profile
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="md:ml-64 min-h-screen">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Welcome back</p>
            <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
          </div>

          <button
            onClick={handleLogout}
            className="md:hidden rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm"
          >
            Logout
          </button>
        </header>

        <div className="p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;