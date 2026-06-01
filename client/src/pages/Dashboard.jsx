import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Flame,
  Scale,
  Target,
  Dumbbell,
  Droplets,
  CalendarDays,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const formatDate = (dateInput) => {
  if (!dateInput) return "";
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

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

  const chartData = useMemo(() => {
    const last7Meals = dashboard?.charts?.last7Meals || [];
    const last7Workouts = dashboard?.charts?.last7Workouts || [];
    const last7Habits = dashboard?.charts?.last7Habits || [];
    const recentProgressLogs = dashboard?.charts?.recentProgressLogs || [];

    const dailyMap = {};

    last7Meals.forEach((meal) => {
      const date = formatDate(meal.date);

      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          calories: 0,
          protein: 0,
          burned: 0,
          habit: 0,
        };
      }

      dailyMap[date].calories += meal.totalCalories || 0;
      dailyMap[date].protein += meal.totalProtein || 0;
    });

    last7Workouts.forEach((workout) => {
      const date = formatDate(workout.date);

      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          calories: 0,
          protein: 0,
          burned: 0,
          habit: 0,
        };
      }

      dailyMap[date].burned += workout.caloriesBurned || 0;
    });

    last7Habits.forEach((habit) => {
      const date = formatDate(habit.date);

      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          calories: 0,
          protein: 0,
          burned: 0,
          habit: 0,
        };
      }

      dailyMap[date].habit = habit.completionPercentage || 0;
    });

    const nutritionWorkoutData = Object.values(dailyMap);

    const weightData = recentProgressLogs.map((log) => ({
      date: formatDate(log.date),
      weight: log.weight || 0,
      waist: log.waist || 0,
      bodyFat: log.bodyFatPercentage || 0,
    }));

    return {
      nutritionWorkoutData,
      weightData,
    };
  }, [dashboard]);

 if (loading) {
  return (
    <PageLoader
      title="Loading dashboard"
      message="Fetching your calories, workouts, habits, and progress."
    />
  );
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
      helper: "Food intake",
    },
    {
      title: "Protein Today",
      value: todayNutrition?.protein || 0,
      icon: Target,
      suffix: "g",
      helper: "Protein target",
    },
    {
      title: "Calories Burned",
      value: todayWorkout?.caloriesBurned || 0,
      icon: Activity,
      suffix: "kcal",
      helper: "Workout burn",
    },
    {
      title: "Current Weight",
      value: bodyProgress?.currentWeight || "--",
      icon: Scale,
      suffix: bodyProgress?.currentWeight ? "kg" : "",
      helper: "Latest log",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400">
            Track your transformation progress in one place.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          Today: {new Date().toLocaleDateString()}
        </div>
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
                <div>
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <p className="text-xs text-slate-500">{card.helper}</p>
                </div>

                <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {card.value}{" "}
                <span className="text-base text-slate-400">{card.suffix}</span>
              </h2>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-4 mt-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Habit Completion</p>
            <CalendarDays className="text-orange-400" size={20} />
          </div>
          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.today?.habitCompletion || 0}%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Current Streak</p>
            <Flame className="text-orange-400" size={20} />
          </div>
          <h2 className="text-3xl font-bold mt-2">
            {weekly?.currentStreak || 0}{" "}
            <span className="text-base text-slate-400">days</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Weight Change</p>
            <Scale className="text-orange-400" size={20} />
          </div>
          <h2 className="text-3xl font-bold mt-2">
            {bodyProgress?.weightChange || 0}{" "}
            <span className="text-base text-slate-400">kg</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">Weekly Workouts</p>
            <Dumbbell className="text-orange-400" size={20} />
          </div>
          <h2 className="text-3xl font-bold mt-2">
            {weekly?.workout?.workoutCount || 0}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Calories vs Burned</h2>
              <p className="text-sm text-slate-400">
                Food intake and workout burn from recent data.
              </p>
            </div>

            <Flame className="text-orange-400" size={22} />
          </div>

          {chartData.nutritionWorkoutData.length === 0 ? (
            <p className="text-slate-400">No calorie chart data yet.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.nutritionWorkoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="calories" name="Calories In" fill="#f97316" />
                  <Bar dataKey="burned" name="Calories Burned" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Weight Trend</h2>
              <p className="text-sm text-slate-400">
                Latest body-weight progress logs.
              </p>
            </div>

            <Scale className="text-orange-400" size={22} />
          </div>

          {chartData.weightData.length === 0 ? (
            <p className="text-slate-400">No weight chart data yet.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name="Weight"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Protein Intake</h2>
              <p className="text-sm text-slate-400">
                Recent protein intake from meals.
              </p>
            </div>

            <Target className="text-orange-400" size={22} />
          </div>

          {chartData.nutritionWorkoutData.length === 0 ? (
            <p className="text-slate-400">No protein chart data yet.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.nutritionWorkoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="protein" name="Protein" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Habit Consistency</h2>
              <p className="text-sm text-slate-400">
                Completion percentage from recent habit logs.
              </p>
            </div>

            <Droplets className="text-orange-400" size={22} />
          </div>

          {chartData.nutritionWorkoutData.length === 0 ? (
            <p className="text-slate-400">No habit chart data yet.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.nutritionWorkoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="habit"
                    name="Habit Completion"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;