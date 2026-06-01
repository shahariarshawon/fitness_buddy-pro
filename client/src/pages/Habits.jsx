import { useEffect, useState } from "react";
import { CheckCircle, CalendarDays, Flame, BarChart3 } from "lucide-react";
import api from "../services/api";

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const defaultHabitData = {
  date: getTodayDate(),
  workoutCompleted: false,
  cardioCompleted: false,
  dietFollowed: false,
  waterCompleted: false,
  sleepAchieved: false,
  prayerCompleted: false,
  studyCompleted: false,
  proteinTargetAchieved: false,
  notes: "",
};

const habitItems = [
  {
    name: "workoutCompleted",
    label: "Workout Completed",
    description: "Main gym or home workout done",
  },
  {
    name: "cardioCompleted",
    label: "Cardio Completed",
    description: "Walking, cycling, running, or active recovery",
  },
  {
    name: "dietFollowed",
    label: "Diet Followed",
    description: "Stayed close to planned meals",
  },
  {
    name: "waterCompleted",
    label: "Water Target Completed",
    description: "Reached daily water goal",
  },
  {
    name: "sleepAchieved",
    label: "Sleep Target Achieved",
    description: "Reached planned sleep target",
  },
  {
    name: "prayerCompleted",
    label: "Prayer Completed",
    description: "Daily prayer habit completed",
  },
  {
    name: "studyCompleted",
    label: "Study Completed",
    description: "Completed planned study session",
  },
  {
    name: "proteinTargetAchieved",
    label: "Protein Target Achieved",
    description: "Reached daily protein goal",
  },
];

const Habits = () => {
  const [habitData, setHabitData] = useState(defaultHabitData);
  const [habits, setHabits] = useState([]);
  const [summary, setSummary] = useState({
    totalDaysTracked: 0,
    averageCompletion: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  const [todayCompletion, setTodayCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("/habits/today"),
      api.get("/habits/summary"),
      api.get("/habits"),
    ])
      .then(([todayResponse, summaryResponse, historyResponse]) => {
        if (!isMounted) return;

        const todayHabit = todayResponse.data.habit;

        if (todayHabit) {
          setHabitData({
            date: getTodayDate(),
            workoutCompleted: todayHabit.workoutCompleted || false,
            cardioCompleted: todayHabit.cardioCompleted || false,
            dietFollowed: todayHabit.dietFollowed || false,
            waterCompleted: todayHabit.waterCompleted || false,
            sleepAchieved: todayHabit.sleepAchieved || false,
            prayerCompleted: todayHabit.prayerCompleted || false,
            studyCompleted: todayHabit.studyCompleted || false,
            proteinTargetAchieved: todayHabit.proteinTargetAchieved || false,
            notes: todayHabit.notes || "",
          });

          setTodayCompletion(todayHabit.completionPercentage || 0);
        }

        setSummary(summaryResponse.data.summary || {});
        setHabits(historyResponse.data.habits || []);
      })
      .catch((error) => {
        console.error("Habit page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load habit data.");
        }
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

  const fetchHabitData = async () => {
    const [todayResponse, summaryResponse, historyResponse] = await Promise.all([
      api.get("/habits/today"),
      api.get("/habits/summary"),
      api.get("/habits"),
    ]);

    const todayHabit = todayResponse.data.habit;

    if (todayHabit) {
      setTodayCompletion(todayHabit.completionPercentage || 0);
    }

    setSummary(summaryResponse.data.summary || {});
    setHabits(historyResponse.data.habits || []);
  };

  const calculateLocalCompletion = () => {
    const completedCount = habitItems.filter(
      (item) => habitData[item.name]
    ).length;

    return Math.round((completedCount / habitItems.length) * 100);
  };

  const handleCheckboxChange = (name) => {
    setHabitData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleNotesChange = (e) => {
    setHabitData((prev) => ({
      ...prev,
      notes: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/habits", habitData);

      setTodayCompletion(response.data.habit.completionPercentage || 0);

      await fetchHabitData();

      setMessage("Habit tracker saved successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save habits.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-300">Loading habits...</div>;
  }

  const liveCompletion = calculateLocalCompletion();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Habit Tracker</h1>
        <p className="text-slate-400">
          Track your daily consistency, streaks, and transformation habits.
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Today Completion</p>
            <CheckCircle className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{liveCompletion}%</h2>
          <p className="mt-1 text-xs text-slate-500">
            Saved value: {todayCompletion}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Current Streak</p>
            <Flame className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {summary?.currentStreak || 0}
            <span className="text-base text-slate-400"> days</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Best Streak</p>
            <CalendarDays className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {summary?.bestStreak || 0}
            <span className="text-base text-slate-400"> days</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Average Completion</p>
            <BarChart3 className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {summary?.averageCompletion || 0}%
          </h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Today’s Checklist</h2>
              <p className="text-sm text-slate-400">
                Complete at least 70% to count toward streak.
              </p>
            </div>

            <input
              type="date"
              value={habitData.date}
              onChange={(e) =>
                setHabitData((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {habitItems.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleCheckboxChange(item.name)}
                className={`rounded-2xl border p-4 text-left transition ${
                  habitData[item.name]
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-5 w-5 rounded-md border flex items-center justify-center ${
                      habitData[item.name]
                        ? "border-orange-500 bg-orange-500"
                        : "border-slate-600"
                    }`}
                  >
                    {habitData[item.name] && (
                      <span className="text-xs font-bold text-white">✓</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">{item.label}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="block text-sm text-slate-300 mb-1">Notes</label>
            <textarea
              value={habitData.notes}
              onChange={handleNotesChange}
              rows="3"
              placeholder="Example: Good day, but need more water."
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Habits"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Consistency Summary</h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Total Days Tracked</p>
              <h3 className="text-3xl font-bold">
                {summary?.totalDaysTracked || 0}
              </h3>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Success Rule</p>
              <h3 className="text-lg font-semibold mt-1">70% or higher</h3>
              <p className="text-xs text-slate-500 mt-1">
                Days with 70% completion count as successful consistency days.
              </p>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Today Status</p>
              <h3
                className={`text-lg font-semibold mt-1 ${
                  liveCompletion >= 70 ? "text-green-300" : "text-orange-300"
                }`}
              >
                {liveCompletion >= 70 ? "On Track" : "Needs Improvement"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-5">Habit History</h2>

        {habits.length === 0 ? (
          <div className="text-slate-400">No habit history yet.</div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <div
                key={habit._id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {new Date(habit.date).toLocaleDateString()}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Completion: {habit.completionPercentage || 0}%
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {habitItems.map((item) => (
                        <span
                          key={item.name}
                          className={`rounded-lg px-3 py-1 text-sm ${
                            habit[item.name]
                              ? "bg-green-500/10 text-green-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>

                    {habit.notes && (
                      <p className="text-sm text-slate-400 mt-3">
                        {habit.notes}
                      </p>
                    )}
                  </div>

                  <div
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      habit.completionPercentage >= 70
                        ? "bg-green-500/10 text-green-300"
                        : "bg-orange-500/10 text-orange-300"
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