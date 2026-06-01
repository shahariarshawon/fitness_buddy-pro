import { useEffect, useState } from "react";
import { Activity, Flame, Scale, Target } from "lucide-react";
import api from "../services/api";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/dashboard/summary")
      .then((response) => {
        if (isMounted) {
          setDashboard(response.data.dashboard);
        }
      })
      .catch((error) => {
        console.error("Dashboard fetch error:", error.response?.data || error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-slate-300">Loading dashboard...</div>;
  }

  const todayNutrition = dashboard?.today?.nutrition;
  const todayWorkout = dashboard?.today?.workout;
  const bodyProgress = dashboard?.bodyProgress;
  const weekly = dashboard?.weekly;

  const cards = [
    {
      title: "Calories Today",
      value: todayNutrition?.calories || 0,
      icon: Flame,
      suffix: "kcal",
    },
    {
      title: "Protein Today",
      value: todayNutrition?.protein || 0,
      icon: Target,
      suffix: "g",
    },
    {
      title: "Calories Burned",
      value: todayWorkout?.caloriesBurned || 0,
      icon: Activity,
      suffix: "kcal",
    },
    {
      title: "Current Weight",
      value: bodyProgress?.currentWeight || "--",
      icon: Scale,
      suffix: bodyProgress?.currentWeight ? "kg" : "",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">
          Track your transformation progress in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{card.title}</p>
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {card.value}{" "}
                <span className="text-base text-slate-400">
                  {card.suffix}
                </span>
              </h2>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Habit Completion</p>
          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.today?.habitCompletion || 0}%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Current Streak</p>
          <h2 className="text-3xl font-bold mt-2">
            {weekly?.currentStreak || 0} days
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-400 text-sm">Weight Change</p>
          <h2 className="text-3xl font-bold mt-2">
            {bodyProgress?.weightChange || 0} kg
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;