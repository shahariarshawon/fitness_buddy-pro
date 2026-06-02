import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Scale,
  Sparkles,
  Target,
  TrendingDown,
  Utensils,
  Waves,
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
import { Link } from "react-router-dom";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const formatDate = (dateInput) => {
  if (!dateInput) return "";

  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "--";

  const number = Number(value);

  if (Number.isNaN(number)) return "--";

  return number.toFixed(decimals);
};

const StatCard = ({ title, value, suffix, helper, icon: Icon, progress }) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#009587]/10 blur-2xl transition group-hover:bg-[#009587]/20" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
          <Icon size={21} />
        </div>
      </div>

      <div className="relative mt-5">
        <h2 className="text-3xl font-bold tracking-tight">
          {value}{" "}
          {suffix && (
            <span className="text-base font-medium text-slate-400">
              {suffix}
            </span>
          )}
        </h2>

        {progress !== undefined && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
              <span>Target progress</span>
              <span>{Math.min(Number(progress || 0), 100)}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]"
                style={{
                  width: `${Math.min(Number(progress || 0), 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value, suffix, icon: Icon }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{label}</p>
        <Icon className="text-[#00c2ad]" size={20} />
      </div>

      <h2 className="text-3xl font-bold tracking-tight">
        {value}{" "}
        {suffix && (
          <span className="text-base font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </h2>
    </div>
  );
};

const ChartCard = ({ title, subtitle, icon: Icon, children, empty }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
          <Icon size={22} />
        </div>
      </div>

      {empty ? (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] text-center text-sm text-slate-400">
          No chart data yet.
        </div>
      ) : (
        <div className="h-80">{children}</div>
      )}
    </div>
  );
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
    const daily = dashboard?.charts?.daily || [];
    const recentProgressLogs = dashboard?.charts?.recentProgressLogs || [];

    const nutritionWorkoutData = daily.map((item) => ({
      date: formatDate(item.date),
      calories: Math.round(Number(item.calories || 0)),
      protein: Math.round(Number(item.protein || 0)),
      carbs: Math.round(Number(item.carbs || 0)),
      fats: Math.round(Number(item.fats || 0)),
      burned: Math.round(Number(item.caloriesBurned || 0)),
      habit: Math.round(Number(item.habitCompletion || 0)),
      steps: Number(item.steps || 0),
      water: Number(item.waterLiters || 0),
      sleep: Number(item.sleepHours || 0),
    }));

    const weightData =
      recentProgressLogs.length > 0
        ? recentProgressLogs.map((log) => ({
            date: formatDate(log.date),
            weight: Number(log.weight || 0),
            waist: Number(log.waist || 0),
            bodyFat: Number(log.bodyFatPercentage || 0),
          }))
        : daily
            .filter((item) => item.weight || item.waist)
            .map((item) => ({
              date: formatDate(item.date),
              weight: Number(item.weight || 0),
              waist: Number(item.waist || 0),
              bodyFat: Number(item.bodyFatPercentage || 0),
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
        message="Fetching your calories, workouts, habits, progress, and transformation plan."
      />
    );
  }

  const todayNutrition = dashboard?.today?.nutrition || {};
  const todayWorkout = dashboard?.today?.workout || {};
  const todayHabit = dashboard?.today?.habit || {};
  const bodyProgress = dashboard?.bodyProgress || {};
  const weekly = dashboard?.weekly || {};
  const targets = dashboard?.targets || {};
  const activePlan = dashboard?.activePlan;
  const todayPlan = dashboard?.todayPlan;
  const recommendations = dashboard?.recommendations || [];

  const cards = [
    {
      title: "Calories Today",
      value: formatNumber(todayNutrition.calories),
      icon: Flame,
      suffix: "kcal",
      helper: `${formatNumber(todayNutrition.remaining?.calories)} kcal remaining`,
      progress: todayNutrition.progress?.calories || 0,
    },
    {
      title: "Protein Today",
      value: formatNumber(todayNutrition.protein),
      icon: Target,
      suffix: "g",
      helper: `${formatNumber(todayNutrition.remaining?.protein)}g remaining`,
      progress: todayNutrition.progress?.protein || 0,
    },
    {
      title: "Workout Burn",
      value: formatNumber(todayWorkout.caloriesBurned),
      icon: Activity,
      suffix: "kcal",
      helper: `${todayWorkout.workoutCount || 0} workout logged`,
    },
    {
      title: "Current Weight",
      value: formatNumber(bodyProgress.currentWeight, 1),
      icon: Scale,
      suffix: bodyProgress.currentWeight ? "kg" : "",
      helper: `Change: ${formatNumber(bodyProgress.weightChange, 1)} kg`,
    },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#009587]/20 via-white/[0.04] to-[#00809d]/20 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00c2ad]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#009587]/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ec]">
              <Sparkles size={14} />
              Transformation Dashboard
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Track your full daily system
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Monitor meals, macros, workouts, habits, body progress, weekly
              consistency, and transformation recommendations in one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[25rem]">
            <div className="rounded-3xl border border-white/10 bg-[#07191d]/60 p-4 backdrop-blur-xl">
              <p className="text-xs text-slate-400">Today</p>
              <p className="mt-1 text-lg font-semibold">
                {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#07191d]/60 p-4 backdrop-blur-xl">
              <p className="text-xs text-slate-400">Goal</p>
              <p className="mt-1 text-lg font-semibold capitalize">
                {dashboard?.profile?.goal?.replace("_", " ") || "Fitness"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan + Today */}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Active plan</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {activePlan?.name || "No active plan yet"}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/25">
              <CalendarDays size={21} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-slate-400">Goal type</p>
              <p className="mt-1 font-semibold capitalize">
                {activePlan?.goalType?.replace("_", " ") || "--"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-slate-400">Today session</p>
              <p className="mt-1 font-semibold">
                {todayPlan?.sessionName || "--"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-slate-400">Status</p>
              <p className="mt-1 font-semibold capitalize">
                {todayPlan?.status?.replace("_", " ") || "Not planned"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/today"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              Open Today’s Plan
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/plans"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              Manage Plans
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Today’s habit score</p>
              <h2 className="mt-1 text-4xl font-bold">
                {todayHabit?.completionPercentage || 0}
                <span className="text-lg text-slate-400">%</span>
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec] ring-1 ring-[#009587]/20">
              <CheckCircle size={22} />
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]"
              style={{
                width: `${Math.min(
                  Number(todayHabit?.completionPercentage || 0),
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/[0.04] p-3">
              <p className="text-slate-400">Water</p>
              <p className="font-semibold">
                {formatNumber(todayHabit.waterIntakeLiters, 1)} /{" "}
                {formatNumber(targets.waterLiters, 1)} L
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-3">
              <p className="text-slate-400">Steps</p>
              <p className="font-semibold">
                {formatNumber(todayHabit.stepsCount)} /{" "}
                {formatNumber(targets.steps)}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-3">
              <p className="text-slate-400">Sleep</p>
              <p className="font-semibold">
                {formatNumber(todayHabit.sleepHours, 1)} /{" "}
                {formatNumber(targets.sleepHours, 1)} h
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-3">
              <p className="text-slate-400">Protein</p>
              <p className="font-semibold">
                {formatNumber(todayNutrition.protein)} /{" "}
                {formatNumber(targets.protein)} g
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Mini metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric
          label="Weekly Workouts"
          value={weekly?.workout?.workoutCount || 0}
          icon={Dumbbell}
        />

        <MiniMetric
          label="Current Streak"
          value={weekly?.habits?.currentStreak || 0}
          suffix="days"
          icon={Flame}
        />

        <MiniMetric
          label="Waist Change"
          value={formatNumber(bodyProgress?.waistChange, 1)}
          suffix="cm"
          icon={TrendingDown}
        />

        <MiniMetric
          label="Workout Volume"
          value={formatNumber(weekly?.workout?.totalVolume)}
          suffix="kg"
          icon={BarChart3}
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec]">
              <HeartPulse size={20} />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Smart recommendations
              </h2>
              <p className="text-sm text-slate-400">
                Based on your meals, workouts, habits, and progress.
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {recommendations.slice(0, 4).map((item, index) => (
              <div
                key={`${item.type}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle
                    size={16}
                    className={
                      item.priority === "high"
                        ? "text-red-300"
                        : item.priority === "medium"
                          ? "text-[#00c2ad]"
                          : "text-slate-400"
                    }
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {item.type}
                  </p>
                </div>

                <p className="text-sm leading-6 text-slate-200">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Calories vs Burned"
          subtitle="Food intake and workout burn from recent data."
          icon={Flame}
          empty={chartData.nutritionWorkoutData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.nutritionWorkoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3438" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#07191d",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="calories"
                name="Calories In"
                fill="#009587"
                radius={[10, 10, 0, 0]}
              />
              <Bar
                dataKey="burned"
                name="Calories Burned"
                fill="#00809d"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Weight & Waist Trend"
          subtitle="Latest body progress logs."
          icon={Scale}
          empty={chartData.weightData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3438" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#07191d",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="#00c2ad"
                strokeWidth={3}
                dot={{ r: 4, fill: "#00c2ad" }}
              />
              <Line
                type="monotone"
                dataKey="waist"
                name="Waist"
                stroke="#00809d"
                strokeWidth={3}
                dot={{ r: 4, fill: "#00809d" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Protein Intake"
          subtitle="Recent protein intake from calculated meal records."
          icon={Target}
          empty={chartData.nutritionWorkoutData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.nutritionWorkoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3438" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#07191d",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="protein"
                name="Protein"
                fill="#00c2ad"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Habits, Steps & Sleep"
          subtitle="Consistency from your upgraded habit tracker."
          icon={Waves}
          empty={chartData.nutritionWorkoutData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.nutritionWorkoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3438" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#07191d",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="habit"
                name="Habit Completion %"
                stroke="#009587"
                strokeWidth={3}
                dot={{ r: 4, fill: "#009587" }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                name="Sleep Hours"
                stroke="#00c2ad"
                strokeWidth={3}
                dot={{ r: 4, fill: "#00c2ad" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/meals"
          className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec]">
            <Utensils size={21} />
          </div>

          <h3 className="text-lg font-semibold">Record Meal</h3>
          <p className="mt-1 text-sm text-slate-400">
            Add rice, roti, egg, chicken, dal, or custom food with calculated
            macros.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00c2ad]">
            Add meal
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to="/workouts"
          className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00809d]/15 text-[#9ff7ec]">
            <Dumbbell size={21} />
          </div>

          <h3 className="text-lg font-semibold">Record Workout</h3>
          <p className="mt-1 text-sm text-slate-400">
            Log strength sets or cardio duration dynamically by exercise type.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00c2ad]">
            Add workout
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to="/habits"
          className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
        >
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00c2ad]/15 text-[#9ff7ec]">
            <Footprints size={21} />
          </div>

          <h3 className="text-lg font-semibold">Update Habits</h3>
          <p className="mt-1 text-sm text-slate-400">
            Track water, steps, sleep, protein, prayer, study, and daily
            discipline.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00c2ad]">
            Open habits
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;