import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Moon,
  RefreshCcw,
  Scale,
  Sparkles,
  Target,
  Trash2,
  Utensils,
  Wheat,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "--";

  const number = Number(value);

  if (Number.isNaN(number)) return "--";

  return number.toFixed(decimals);
};

const formatDate = (dateInput) => {
  if (!dateInput) return "--";

  return new Date(dateInput).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  if (["completed", "on_track", "excellent"].includes(status)) {
    return "bg-[#009587]/15 text-[#9ff7ec] border-[#009587]/25";
  }

  if (["partially_completed", "in_progress", "planned"].includes(status)) {
    return "bg-[#00809d]/15 text-[#9ff7ec] border-[#00809d]/25";
  }

  if (["skipped", "needs_adjustment", "poor"].includes(status)) {
    return "bg-red-500/10 text-red-200 border-red-400/20";
  }

  return "bg-white/[0.05] text-slate-300 border-white/10";
};

const StatCard = ({ title, value, suffix, helper, icon: Icon, progress }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#009587]/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {value}
            {suffix && (
              <span className="text-base font-medium text-slate-400">
                {" "}
                {suffix}
              </span>
            )}
          </h2>

          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
          <Icon size={21} />
        </div>
      </div>

      {progress !== undefined && (
        <div className="relative mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>Progress</span>
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
  );
};

const SectionCard = ({ title, subtitle, icon: Icon, action, children }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {action}

          {Icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
              <Icon size={21} />
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};

const EmptyBox = ({ title, message, to, buttonText }) => {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
      <p className="text-lg font-semibold text-slate-200">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{message}</p>

      {to && (
        <Link
          to={to}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
        >
          {buttonText}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
};

const Today = () => {
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getTodayData = async () => {
    const response = await api.get("/dashboard/today");
    return response.data.today;
  };

  const refreshToday = async () => {
    const data = await getTodayData();
    setTodayData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadToday = async () => {
      try {
        const data = await getTodayData();

        if (!isMounted) return;

        setTodayData(data);
      } catch (error) {
  console.error("Today page fetch error:", {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
  });

  if (isMounted) {
    setError(
      error.response?.data?.message ||
        `Failed to load today’s data. Status: ${
          error.response?.status || "network error"
        }`
    );
  }
}finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadToday();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSyncHabit = async () => {
    setSyncing(true);
    setMessage("");
    setError("");

    try {
      await api.patch("/habits/sync-today");
      await refreshToday();
      setMessage("Today’s habits synced with meals and workouts.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sync today.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    const confirmDelete = window.confirm("Delete this meal?");

    if (!confirmDelete) return;

    setDeletingMealId(mealId);
    setMessage("");
    setError("");

    try {
      await api.delete(`/meals/${mealId}`);
      await refreshToday();
      setMessage("Meal deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete meal.");
    } finally {
      setDeletingMealId(null);
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    const confirmDelete = window.confirm("Delete this workout?");

    if (!confirmDelete) return;

    setDeletingWorkoutId(workoutId);
    setMessage("");
    setError("");

    try {
      await api.delete(`/workouts/${workoutId}`);
      await refreshToday();
      setMessage("Workout deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete workout.");
    } finally {
      setDeletingWorkoutId(null);
    }
  };

  const today = todayData || {};
  const targets = today.targets || {};
  const nutrition = today.nutrition || {};
  const workout = today.workout || {};
  const habit = today.habit || {};
  const planDay = today.planDay;
  const meals = today.meals || [];
  const workouts = today.workouts || [];
  const progress = today.progress;

  const dailyThreeTask = useMemo(() => {
    const movement =
      habit?.workoutCompleted ||
      habit?.cardioCompleted ||
      habit?.mobilityCompleted ||
      workout?.workoutCount > 0;

    const nutritionDone =
      habit?.dietFollowed ||
      habit?.proteinTargetAchieved ||
      nutrition?.mealCount > 0;

    const growth = habit?.studyCompleted || habit?.personalDevelopmentCompleted;

    return {
      movement,
      nutritionDone,
      growth,
      success: movement && nutritionDone && growth,
    };
  }, [habit, workout, nutrition]);

  if (loading) {
    return (
      <PageLoader
        title="Loading today"
        message="Preparing today’s meals, workout, habits, progress, and plan."
      />
    );
  }

  const topCards = [
    {
      title: "Calories",
      value: formatNumber(nutrition.calories),
      suffix: "kcal",
      helper: `${formatNumber(targets.calories)} kcal target`,
      icon: Flame,
      progress: nutrition.progress?.calories || 0,
    },
    {
      title: "Protein",
      value: formatNumber(nutrition.protein),
      suffix: "g",
      helper: `${formatNumber(targets.protein)}g target`,
      icon: Target,
      progress: nutrition.progress?.protein || 0,
    },
    {
      title: "Water",
      value: formatNumber(habit?.waterIntakeLiters, 1),
      suffix: "L",
      helper: `${formatNumber(targets.waterLiters, 1)}L target`,
      icon: Droplets,
      progress: nutrition.progress?.water || 0,
    },
    {
      title: "Workout",
      value: formatNumber(workout.duration),
      suffix: "min",
      helper: `${workout.workoutCount || 0} session today`,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#009587]/20 via-white/[0.04] to-[#00809d]/20 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00c2ad]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#00809d]/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ec]">
              <Sparkles size={14} />
              Today’s Control Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Today’s fitness system
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              {formatDate(today.date)} • Track today’s meals, macros, workout,
              water, steps, sleep, habits, and body check-in.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSyncHabit}
              disabled={syncing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={16} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Today"}
            </button>

            <Link
              to="/meals"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              Add Meal
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-[#009587]/25 bg-[#009587]/10 px-4 py-3 text-sm text-[#9ff7ec]">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Plan + habit score */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Today’s plan"
          subtitle="PlanDay data from the backend, if available."
          icon={CalendarDays}
          action={
            <Link
              to="/plans"
              className="hidden rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] sm:inline-flex"
            >
              Plans
            </Link>
          }
        >
          {planDay ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {planDay.sessionName || `Day ${planDay.dayNumber || ""}`}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Focus:{" "}
                    <span className="capitalize text-slate-200">
                      {planDay.mainFocus?.replace("_", " ") || "Not set"}
                    </span>{" "}
                    • Type:{" "}
                    <span className="capitalize text-slate-200">
                      {planDay.dayType?.replace("_", " ") || "Not set"}
                    </span>
                  </p>
                </div>

                <span
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold capitalize ${getStatusClass(
                    planDay.status,
                  )}`}
                >
                  {planDay.status?.replace("_", " ") || "planned"}
                </span>
              </div>

              {planDay.targets && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-400">Calories</p>
                    <p className="mt-1 text-lg font-bold">
                      {planDay.targets.calories || "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-400">Protein</p>
                    <p className="mt-1 text-lg font-bold">
                      {planDay.targets.protein || "--"}g
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-4">
                    <p className="text-xs text-slate-400">Steps</p>
                    <p className="mt-1 text-lg font-bold">
                      {planDay.targets.steps || "--"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyBox
              title="No plan assigned for today"
              message="You can still log meals, workouts, habits, and progress manually."
              to="/plans"
              buttonText="Create Plan"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Habit score"
          subtitle="Calculated by your upgraded Habit model."
          icon={CheckCircle}
        >
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-5xl font-bold tracking-tight">
                {habit?.completionPercentage || 0}
                <span className="text-xl text-slate-400">%</span>
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Required task score:{" "}
                {habit?.requiredTaskCompletionPercentage || 0}%
              </p>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#009587]/30 bg-[#009587]/10 text-[#9ff7ec]">
              <CheckCircle size={42} />
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]"
              style={{
                width: `${Math.min(Number(habit?.completionPercentage || 0), 100)}%`,
              }}
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              {
                label: "Movement",
                active: dailyThreeTask.movement,
              },
              {
                label: "Nutrition",
                active: dailyThreeTask.nutritionDone,
              },
              {
                label: "Growth",
                active: dailyThreeTask.growth,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-3 py-3 text-center text-xs font-semibold ${
                  item.active
                    ? "border-[#009587]/25 bg-[#009587]/15 text-[#9ff7ec]"
                    : "border-white/10 bg-white/[0.04] text-slate-400"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Macro + habit details */}
      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Macros"
          subtitle="Today’s calculated nutrition totals."
          icon={Utensils}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Carbs",
                value: nutrition.carbs,
                target: targets.carbs,
                icon: Wheat,
                suffix: "g",
              },
              {
                label: "Fats",
                value: nutrition.fats,
                target: targets.fats,
                icon: Droplets,
                suffix: "g",
              },
              {
                label: "Fiber",
                value: nutrition.fiber,
                target: targets.fiber,
                icon: HeartPulse,
                suffix: "g",
              },
              {
                label: "Meals",
                value: nutrition.mealCount,
                target: null,
                icon: Utensils,
                suffix: "",
              },
            ].map((item) => {
              const Icon = item.icon;
              const progress =
                item.target && Number(item.target) > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (Number(item.value || 0) / Number(item.target)) * 100,
                      ),
                    )
                  : 0;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/[0.04] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-slate-400">{item.label}</p>
                    <Icon size={18} className="text-[#00c2ad]" />
                  </div>

                  <p className="text-2xl font-bold">
                    {formatNumber(item.value)}
                    {item.suffix && (
                      <span className="text-sm text-slate-400">
                        {" "}
                        {item.suffix}
                      </span>
                    )}
                  </p>

                  {item.target && (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Daily numbers"
          subtitle="Water, steps, sleep, and study."
          icon={BarChart3}
        >
          <div className="space-y-3">
            {[
              {
                label: "Steps",
                value: habit?.stepsCount || 0,
                target: targets.steps || habit?.stepsTarget || 8000,
                suffix: "steps",
                icon: Footprints,
              },
              {
                label: "Sleep",
                value: habit?.sleepHours || 0,
                target: targets.sleepHours || habit?.sleepTargetHours || 8,
                suffix: "h",
                icon: Moon,
              },
              {
                label: "Study",
                value: habit?.studyMinutes || 0,
                target: habit?.studyTargetMinutes || 45,
                suffix: "min",
                icon: CalendarDays,
              },
            ].map((item) => {
              const Icon = item.icon;
              const progress =
                item.target && Number(item.target) > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (Number(item.value || 0) / Number(item.target)) * 100,
                      ),
                    )
                  : 0;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/[0.04] p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={17} className="text-[#00c2ad]" />
                      <p className="text-sm font-semibold">{item.label}</p>
                    </div>

                    <p className="text-xs text-slate-400">{progress}%</p>
                  </div>

                  <p className="text-sm text-slate-400">
                    {formatNumber(item.value, item.label === "Sleep" ? 1 : 0)} /{" "}
                    {formatNumber(item.target, item.label === "Sleep" ? 1 : 0)}{" "}
                    {item.suffix}
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Body check-in"
          subtitle="Today’s progress log."
          icon={Scale}
        >
          {progress ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-400">Weight</p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatNumber(progress.weight, 1)} kg
                  </p>
                </div>

                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-400">Waist</p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatNumber(progress.waist, 1)} cm
                  </p>
                </div>

                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-400">BMI</p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatNumber(progress.bmi, 1)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-semibold capitalize">
                    {progress.progressStatus?.replace("_", " ") || "--"}
                  </p>
                </div>
              </div>

              <Link
                to="/progress"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                View progress
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <EmptyBox
              title="No body check-in today"
              message="Add today’s weight, waist, body measurements, and progress status."
              to="/progress"
              buttonText="Add Progress"
            />
          )}
        </SectionCard>
      </div>

      {/* Meals and workouts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Today’s meals"
          subtitle="Calculated from the upgraded meal model."
          icon={Utensils}
          action={
            <Link
              to="/meals"
              className="hidden rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 sm:inline-flex"
            >
              Add Meal
            </Link>
          }
        >
          {meals.length === 0 ? (
            <EmptyBox
              title="No meals logged today"
              message="Record breakfast, lunch, dinner, snacks, or workout meals."
              to="/meals"
              buttonText="Record Meal"
            />
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div
                  key={meal._id}
                  className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {meal.mealType?.replace("_", " ")}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {meal.totalCalories || 0} kcal •{" "}
                        {meal.totalProtein || 0}g protein •{" "}
                        {meal.totalCarbs || 0}g carbs • {meal.totalFats || 0}g
                        fats
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteMeal(meal._id)}
                      disabled={deletingMealId === meal._id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {meal.foods?.map((food, index) => (
                      <span
                        key={`${meal._id}-${index}`}
                        className="rounded-xl bg-white/[0.05] px-3 py-1 text-sm text-slate-300"
                      >
                        {food.name} (
                        {food.quantity || food.servingLabel || "serving"}) —{" "}
                        {food.calories || 0} kcal
                      </span>
                    ))}
                  </div>

                  {meal.notes && (
                    <p className="mt-3 text-sm text-slate-400">{meal.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Today’s workouts"
          subtitle="Strength logs and cardio duration are both supported."
          icon={Dumbbell}
          action={
            <Link
              to="/workouts"
              className="hidden rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 sm:inline-flex"
            >
              Add Workout
            </Link>
          }
        >
          {workouts.length === 0 ? (
            <EmptyBox
              title="No workout logged today"
              message="Record strength sets/reps or cardio duration dynamically."
              to="/workouts"
              buttonText="Record Workout"
            />
          ) : (
            <div className="space-y-4">
              {workouts.map((item) => (
                <div
                  key={item._id}
                  className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {item.workoutName}
                        </h3>

                        <span
                          className={`rounded-xl border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            item.status,
                          )}`}
                        >
                          {item.status?.replace("_", " ") || "completed"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.duration || 0} min • {item.caloriesBurned || 0}{" "}
                        kcal burned • Volume {item.totalVolume || 0}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteWorkout(item._id)}
                      disabled={deletingWorkoutId === item._id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.painReported && (
                    <div className="mb-3 flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      <AlertTriangle size={16} />
                      Pain reported. Avoid load progression.
                    </div>
                  )}

                  <div className="space-y-2">
                    {item.exercises?.slice(0, 5).map((exercise, index) => (
                      <div
                        key={`${item._id}-${index}`}
                        className="rounded-2xl bg-white/[0.04] px-4 py-3"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold">{exercise.name}</p>

                          <p className="text-sm text-slate-400">
                            {exercise.category === "cardio"
                              ? `${exercise.duration || 0} min • ${
                                  exercise.distance || 0
                                } ${exercise.distanceUnit || "km"}`
                              : `${exercise.actualSets || exercise.sets || 0} sets • ${
                                  exercise.actualReps || exercise.reps || 0
                                } reps • ${exercise.bestSetWeight || exercise.weight || 0} kg`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {item.nextWorkoutSuggestion && (
                    <p className="mt-3 text-sm text-[#9ff7ec]">
                      {item.nextWorkoutSuggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: "Record Meal",
            text: "Add food with cup, roti, bowl, egg, piece, or grams.",
            to: "/meals",
            icon: Utensils,
          },
          {
            title: "Record Workout",
            text: "Log strength sets or cardio time dynamically.",
            to: "/workouts",
            icon: Dumbbell,
          },
          {
            title: "Update Habits",
            text: "Water, steps, sleep, prayer, study, and discipline.",
            to: "/habits",
            icon: CheckCircle,
          },
          {
            title: "Upload Photo",
            text: "Add front, side, or back progress photo.",
            to: "/photos",
            icon: Camera,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.to}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec]">
                <Icon size={21} />
              </div>

              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.text}</p>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00c2ad]">
                Open
                <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Today;
