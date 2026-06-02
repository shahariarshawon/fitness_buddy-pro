import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  Moon,
  NotebookText,
  Save,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const defaultHabitData = {
  date: getTodayDate(),
  dayType: "training",

  workoutCompleted: false,
  cardioCompleted: false,
  dietFollowed: false,
  waterCompleted: false,
  sleepAchieved: false,
  prayerCompleted: false,
  studyCompleted: false,
  proteinTargetAchieved: false,

  stepsCompleted: false,
  personalDevelopmentCompleted: false,
  noLateNightScrolling: false,
  sleepShutdownCompleted: false,
  mobilityCompleted: false,

  waterIntakeLiters: 0,
  waterTargetLiters: 3,

  proteinIntakeGrams: 0,
  proteinTargetGrams: 140,

  caloriesIntake: 0,
  caloriesTargetMin: 1800,
  caloriesTargetMax: 2100,

  stepsCount: 0,
  stepsTarget: 8000,

  sleepHours: 0,
  sleepTargetHours: 8,

  studyMinutes: 0,
  studyTargetMinutes: 45,

  personalDevelopmentMinutes: 0,
  personalDevelopmentTargetMinutes: 45,

  prayers: {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  },

  mood: "",
  energyLevel: "",
  hungerLevel: "",
  stressLevel: "",

  notes: "",
};

const checklistItems = [
  {
    name: "workoutCompleted",
    label: "Workout",
    description: "Main gym or home workout completed",
    icon: Activity,
  },
  {
    name: "cardioCompleted",
    label: "Cardio / Walk",
    description: "Walking, cycling, running, or active recovery",
    icon: Footprints,
  },
  {
    name: "dietFollowed",
    label: "Diet Followed",
    description: "Stayed close to planned meals",
    icon: Utensils,
  },
  {
    name: "proteinTargetAchieved",
    label: "Protein Target",
    description: "Reached daily protein target",
    icon: Target,
  },
  {
    name: "waterCompleted",
    label: "Water Target",
    description: "Reached daily water goal",
    icon: Droplets,
  },
  {
    name: "sleepAchieved",
    label: "Sleep Target",
    description: "Reached planned sleep target",
    icon: Moon,
  },
  {
    name: "studyCompleted",
    label: "Study",
    description: "Completed planned study session",
    icon: BookOpen,
  },
  {
    name: "personalDevelopmentCompleted",
    label: "Personal Development",
    description: "Completed career or self-improvement work",
    icon: NotebookText,
  },
  {
    name: "noLateNightScrolling",
    label: "No Late Scrolling",
    description: "Avoided late-night phone scrolling",
    icon: CheckCircle,
  },
  {
    name: "sleepShutdownCompleted",
    label: "Sleep Shutdown",
    description: "Prepared for sleep on time",
    icon: Moon,
  },
  {
    name: "mobilityCompleted",
    label: "Mobility",
    description: "Stretching or mobility work completed",
    icon: HeartPulse,
  },
];

const prayerItems = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

const toNumberOrEmpty = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  return Number(value);
};

const buildHabitFormData = (habit) => {
  if (!habit) return defaultHabitData;

  return {
    ...defaultHabitData,
    ...habit,
    date: habit.date ? habit.date.split("T")[0] : getTodayDate(),

    waterIntakeLiters: habit.waterIntakeLiters || 0,
    waterTargetLiters: habit.waterTargetLiters || 3,

    proteinIntakeGrams: habit.proteinIntakeGrams || 0,
    proteinTargetGrams: habit.proteinTargetGrams || 140,

    caloriesIntake: habit.caloriesIntake || 0,
    caloriesTargetMin: habit.caloriesTargetMin || 1800,
    caloriesTargetMax: habit.caloriesTargetMax || 2100,

    stepsCount: habit.stepsCount || 0,
    stepsTarget: habit.stepsTarget || 8000,

    sleepHours: habit.sleepHours || 0,
    sleepTargetHours: habit.sleepTargetHours || 8,

    studyMinutes: habit.studyMinutes || 0,
    studyTargetMinutes: habit.studyTargetMinutes || 45,

    personalDevelopmentMinutes: habit.personalDevelopmentMinutes || 0,
    personalDevelopmentTargetMinutes:
      habit.personalDevelopmentTargetMinutes || 45,

    prayers: {
      ...defaultHabitData.prayers,
      ...(habit.prayers || {}),
    },

    mood: habit.mood || "",
    energyLevel: habit.energyLevel || "",
    hungerLevel: habit.hungerLevel || "",
    stressLevel: habit.stressLevel || "",

    notes: habit.notes || "",
  };
};

const StatCard = ({ title, value, suffix, icon: Icon, helper }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#009587]/10 blur-2xl" />

      <div className="relative flex items-center justify-between gap-4">
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
    </div>
  );
};

const ProgressInput = ({
  label,
  name,
  targetName,
  value,
  target,
  unit,
  onChange,
  icon: Icon,
}) => {
  const percent =
    target && Number(target) > 0
      ? Math.min(100, Math.round((Number(value || 0) / Number(target)) * 100))
      : 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec]">
            <Icon size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-slate-400">
              {value || 0} / {target || 0} {unit}
            </p>
          </div>
        </div>

        <span className="text-sm font-semibold text-[#00c2ad]">{percent}%</span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min="0"
          step="0.1"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
          placeholder="Actual"
        />

        <input
          type="number"
          name={targetName}
          value={target}
          onChange={onChange}
          min="0"
          step="0.1"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
          placeholder="Target"
        />
      </div>
    </div>
  );
};

const Habits = () => {
  const [habitData, setHabitData] = useState(defaultHabitData);
  const [habits, setHabits] = useState([]);
  const [summary, setSummary] = useState({
    totalDaysTracked: 0,
    averageCompletion: 0,
    currentStreak: 0,
    bestStreak: 0,
    dailyThreeTaskSuccessDays: 0,
  });

  const [todayCompletion, setTodayCompletion] = useState(0);
  const [summaryChart, setSummaryChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getHabitData = async () => {
    const [todayResponse, summaryResponse, historyResponse] = await Promise.all(
      [
        api.get("/habits/today?create=true&sync=true"),
        api.get("/habits/summary"),
        api.get("/habits?limit=10"),
      ],
    );

    return {
      todayHabit: todayResponse.data.habit,
      summaryData: summaryResponse.data.summary || {},
      chartData: summaryResponse.data.charts?.daily || [],
      historyData: historyResponse.data.habits || [],
    };
  };

  const applyHabitData = ({
    todayHabit,
    summaryData,
    chartData,
    historyData,
  }) => {
    if (todayHabit) {
      setHabitData(buildHabitFormData(todayHabit));
      setTodayCompletion(todayHabit.completionPercentage || 0);
    }

    setSummary(summaryData);
    setSummaryChart(chartData);
    setHabits(historyData);
  };

  const refreshHabitData = async () => {
    const data = await getHabitData();
    applyHabitData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadHabitData = async () => {
      try {
        const data = await getHabitData();

        if (!isMounted) return;

        applyHabitData(data);
      } catch (error) {
        console.error("Habit page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load habit data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHabitData();

    return () => {
      isMounted = false;
    };
  }, []);

  const liveCompletion = useMemo(() => {
    const completedCount = checklistItems.filter(
      (item) => habitData[item.name],
    ).length;

    return Math.round((completedCount / checklistItems.length) * 100);
  }, [habitData]);

  const dailyThreeTaskStatus = useMemo(() => {
    const workoutOrWalkDone =
      habitData.workoutCompleted ||
      habitData.cardioCompleted ||
      habitData.mobilityCompleted;

    const nutritionTracked =
      habitData.dietFollowed || habitData.proteinTargetAchieved;

    const careerActionDone =
      habitData.studyCompleted || habitData.personalDevelopmentCompleted;

    return {
      workoutOrWalkDone,
      nutritionTracked,
      careerActionDone,
      success: workoutOrWalkDone && nutritionTracked && careerActionDone,
    };
  }, [habitData]);

  const handleCheckboxChange = (name) => {
    setHabitData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handlePrayerChange = (key) => {
    setHabitData((prev) => ({
      ...prev,
      prayers: {
        ...prev.prayers,
        [key]: !prev.prayers[key],
      },
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setHabitData((prev) => ({
      ...prev,
      [name]: type === "number" ? toNumberOrEmpty(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...habitData,
        energyLevel:
          habitData.energyLevel === "" ? null : Number(habitData.energyLevel),
        hungerLevel:
          habitData.hungerLevel === "" ? null : Number(habitData.hungerLevel),
        stressLevel:
          habitData.stressLevel === "" ? null : Number(habitData.stressLevel),
      };

      const response = await api.post("/habits", payload);

      setHabitData(buildHabitFormData(response.data.habit));
      setTodayCompletion(response.data.habit.completionPercentage || 0);

      await refreshHabitData();

      setMessage("Habit tracker saved successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save habits.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToday = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.patch("/habits/sync-today");

      setHabitData(buildHabitFormData(response.data.habit));
      setTodayCompletion(response.data.habit.completionPercentage || 0);

      await refreshHabitData();

      setMessage("Today’s habit synced from meals and workouts.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sync habits.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading habits"
        message="Preparing your daily habits, streaks, and consistency summary."
      />
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#009587]/20 via-white/[0.04] to-[#00809d]/20 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00c2ad]/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ec]">
              <Sparkles size={14} />
              Transformation Habits
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Daily habit system
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Track workout, meals, water, protein, steps, sleep, prayer, study,
              personal development, and daily discipline in one place.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#07191d]/60 p-4 backdrop-blur-xl">
            <p className="text-xs text-slate-400">Today</p>
            <p className="mt-1 text-lg font-semibold">
              {new Date().toLocaleDateString()}
            </p>
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Live Completion"
          value={liveCompletion}
          suffix="%"
          helper={`Saved value: ${todayCompletion}%`}
          icon={CheckCircle}
        />

        <StatCard
          title="Current Streak"
          value={summary?.currentStreak || 0}
          suffix="days"
          helper="70% or higher"
          icon={Flame}
        />

        <StatCard
          title="Best Streak"
          value={summary?.bestStreak || 0}
          suffix="days"
          helper="Best consistency run"
          icon={CalendarDays}
        />

        <StatCard
          title="Average Completion"
          value={summary?.averageCompletion || 0}
          suffix="%"
          helper={`${summary?.totalDaysTracked || 0} days tracked`}
          icon={BarChart3}
        />
      </div>

      {/* Main form + side summary */}
      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Today’s checklist
              </h2>
              <p className="text-sm text-slate-400">
                The model recalculates completion automatically after saving.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="date"
                name="date"
                value={habitData.date}
                onChange={handleInputChange}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />

              <select
                name="dayType"
                value={habitData.dayType}
                onChange={handleInputChange}
                className="rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="training">Training</option>
                <option value="active_recovery">Active recovery</option>
                <option value="rest">Rest</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {checklistItems.map((item) => {
              const Icon = item.icon;
              const active = habitData[item.name];

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleCheckboxChange(item.name)}
                  className={`group rounded-3xl border p-4 text-left transition ${
                    active
                      ? "border-[#009587]/50 bg-gradient-to-br from-[#009587]/20 to-[#00809d]/10 shadow-lg shadow-[#009587]/10"
                      : "border-white/10 bg-[#061316]/50 hover:border-[#009587]/30 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                        active
                          ? "bg-gradient-to-br from-[#009587] to-[#00809d] text-white"
                          : "bg-white/[0.06] text-slate-400 group-hover:text-[#9ff7ec]"
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">{item.label}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.description}
                      </p>

                      {active && (
                        <p className="mt-2 text-xs font-semibold text-[#9ff7ec]">
                          Completed
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Numeric progress */}
          <div className="mt-6">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Daily numbers
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <ProgressInput
                label="Water"
                name="waterIntakeLiters"
                targetName="waterTargetLiters"
                value={habitData.waterIntakeLiters}
                target={habitData.waterTargetLiters}
                unit="L"
                onChange={handleInputChange}
                icon={Droplets}
              />

              <ProgressInput
                label="Protein"
                name="proteinIntakeGrams"
                targetName="proteinTargetGrams"
                value={habitData.proteinIntakeGrams}
                target={habitData.proteinTargetGrams}
                unit="g"
                onChange={handleInputChange}
                icon={Target}
              />

              <ProgressInput
                label="Steps"
                name="stepsCount"
                targetName="stepsTarget"
                value={habitData.stepsCount}
                target={habitData.stepsTarget}
                unit="steps"
                onChange={handleInputChange}
                icon={Footprints}
              />

              <ProgressInput
                label="Sleep"
                name="sleepHours"
                targetName="sleepTargetHours"
                value={habitData.sleepHours}
                target={habitData.sleepTargetHours}
                unit="h"
                onChange={handleInputChange}
                icon={Moon}
              />

              <ProgressInput
                label="Study"
                name="studyMinutes"
                targetName="studyTargetMinutes"
                value={habitData.studyMinutes}
                target={habitData.studyTargetMinutes}
                unit="min"
                onChange={handleInputChange}
                icon={BookOpen}
              />

              <ProgressInput
                label="Personal Development"
                name="personalDevelopmentMinutes"
                targetName="personalDevelopmentTargetMinutes"
                value={habitData.personalDevelopmentMinutes}
                target={habitData.personalDevelopmentTargetMinutes}
                unit="min"
                onChange={handleInputChange}
                icon={NotebookText}
              />
            </div>
          </div>

          {/* Calories */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#061316]/50 p-4">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Calories range
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Calories intake
                </label>
                <input
                  type="number"
                  name="caloriesIntake"
                  value={habitData.caloriesIntake}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Target min
                </label>
                <input
                  type="number"
                  name="caloriesTargetMin"
                  value={habitData.caloriesTargetMin}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Target max
                </label>
                <input
                  type="number"
                  name="caloriesTargetMax"
                  value={habitData.caloriesTargetMax}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                />
              </div>
            </div>
          </div>

          {/* Prayer */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#061316]/50 p-4">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">
              Prayer tracker
            </h2>

            <div className="grid gap-3 sm:grid-cols-5">
              {prayerItems.map((item) => {
                const active = habitData.prayers?.[item.key];

                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handlePrayerChange(item.key)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-[#009587]/50 bg-[#009587]/15 text-[#9ff7ec]"
                        : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.06]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood and ratings */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Mood</label>
              <select
                name="mood"
                value={habitData.mood}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="">Select</option>
                <option value="great">Great</option>
                <option value="good">Good</option>
                <option value="okay">Okay</option>
                <option value="tired">Tired</option>
                <option value="stressed">Stressed</option>
                <option value="bad">Bad</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Energy, 1-10
              </label>
              <input
                type="number"
                name="energyLevel"
                value={habitData.energyLevel}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Hunger, 1-10
              </label>
              <input
                type="number"
                name="hungerLevel"
                value={habitData.hungerLevel}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Stress, 1-10
              </label>
              <input
                type="number"
                name="stressLevel"
                value={habitData.stressLevel}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-slate-300">Notes</label>
            <textarea
              name="notes"
              value={habitData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Example: Good workout, but need more water."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Habits"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSyncToday}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={18} />
              Sync Meals & Workouts
            </button>
          </div>
        </form>

        {/* Side summary */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Daily 3-task rule
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              One movement task, one nutrition task, and one growth task.
            </p>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: "Workout or walk",
                  active: dailyThreeTaskStatus.workoutOrWalkDone,
                },
                {
                  label: "Nutrition tracked",
                  active: dailyThreeTaskStatus.nutritionTracked,
                },
                {
                  label: "Career / study action",
                  active: dailyThreeTaskStatus.careerActionDone,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                >
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span
                    className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                      item.active
                        ? "bg-[#009587]/15 text-[#9ff7ec]"
                        : "bg-white/[0.05] text-slate-400"
                    }`}
                  >
                    {item.active ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                dailyThreeTaskStatus.success
                  ? "bg-[#009587]/15 text-[#9ff7ec]"
                  : "bg-[#7f265b]/15 text-pink-200"
              }`}
            >
              {dailyThreeTaskStatus.success
                ? "Daily 3-task win achieved"
                : "Daily 3-task win not complete yet"}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Consistency summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Total days tracked</p>
                <h3 className="mt-1 text-3xl font-bold">
                  {summary?.totalDaysTracked || 0}
                </h3>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">3-task success days</p>
                <h3 className="mt-1 text-3xl font-bold">
                  {summary?.dailyThreeTaskSuccessDays || 0}
                </h3>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Today status</p>
                <h3
                  className={`mt-1 text-lg font-semibold ${
                    liveCompletion >= 70 ? "text-[#9ff7ec]" : "text-pink-200"
                  }`}
                >
                  {liveCompletion >= 70 ? "On Track" : "Needs Improvement"}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Small chart-like recent trend */}
      {summaryChart.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <h2 className="text-xl font-semibold tracking-tight">
            Recent habit trend
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Daily completion percentage from recent habit logs.
          </p>

          <div className="mt-5 flex items-end gap-2 overflow-x-auto pb-2">
            {summaryChart.slice(-14).map((item) => {
              const height = Math.max(8, item.completionPercentage || 0);

              return (
                <div
                  key={item.date}
                  className="flex min-w-[3.5rem] flex-col items-center gap-2"
                >
                  <div className="flex h-32 w-full items-end rounded-2xl bg-white/[0.04] p-1">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-[#009587] to-[#00c2ad]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold tracking-tight">Habit history</h2>

        {habits.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No habit history yet.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {habits.map((habit) => (
              <div
                key={habit._id}
                className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {new Date(habit.date).toLocaleDateString()}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Completion: {habit.completionPercentage || 0}% • Steps:{" "}
                      {habit.stepsCount || 0} • Sleep: {habit.sleepHours || 0}h
                      • Water: {habit.waterIntakeLiters || 0}L
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {checklistItems.slice(0, 8).map((item) => (
                        <span
                          key={item.name}
                          className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                            habit[item.name]
                              ? "bg-[#009587]/15 text-[#9ff7ec]"
                              : "bg-white/[0.05] text-slate-500"
                          }`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>

                    {habit.notes && (
                      <p className="mt-3 text-sm text-slate-400">
                        {habit.notes}
                      </p>
                    )}
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                      habit.completionPercentage >= 70
                        ? "bg-[#009587]/15 text-[#9ff7ec]"
                        : "bg-[#7f265b]/15 text-pink-200"
                    }`}
                  >
                    {habit.completionPercentage >= 70
                      ? "Successful Day"
                      : "Below Target"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Habits;
