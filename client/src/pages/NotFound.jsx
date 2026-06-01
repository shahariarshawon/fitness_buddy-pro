import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-slate-400 mb-6">Page not found</p>
        <Link
          to="/dashboard"
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-600"
        >
          Go Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;