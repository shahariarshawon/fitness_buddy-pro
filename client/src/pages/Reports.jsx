import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Dumbbell,
  Flame,
  Target,
  TrendingDown,
} from "lucide-react";
import api from "../services/api";

const getCurrentMonth = () => {
  const date = new Date();
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
};

const getDefaultWeekStart = () => {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const Reports = () => {
  const currentMonth = getCurrentMonth();

  const [activeTab, setActiveTab] = useState("weekly");

  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [overview, setOverview] = useState(null);

  const [weekStartDate, setWeekStartDate] = useState(getDefaultWeekStart());
  const [monthFilter, setMonthFilter] = useState({
    year: currentMonth.year,
    month: currentMonth.month,
  });

  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get(`/reports/weekly?startDate=${weekStartDate}`),
      api.get(
        `/reports/monthly?year=${monthFilter.year}&month=${monthFilter.month}`
      ),
      api.get("/reports/overview"),
    ])
      .then(([weeklyResponse, monthlyResponse, overviewResponse]) => {
        if (!isMounted) return;

        setWeeklyReport(weeklyResponse.data.report || null);
        setMonthlyReport(monthlyResponse.data.report || null);
        setOverview(overviewResponse.data.overview || null);
      })
      .catch((error) => {
        console.error("Reports fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load reports.");
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

  const fetchWeeklyReport = async () => {
    setReportLoading(true);
    setError("");

    try {
      const response = await api.get(`/reports/weekly?startDate=${weekStartDate}`);
      setWeeklyReport(response.data.report || null);
      setActiveTab("weekly");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load weekly report.");
    } finally {
      setReportLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setReportLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/reports/monthly?year=${monthFilter.year}&month=${monthFilter.month}`
      );
      setMonthlyReport(response.data.report || null);
      setActiveTab("monthly");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load monthly report.");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return <div className="text-slate-300">Loading reports...</div>;
  }

  const selectedReport = activeTab === "weekly" ? weeklyReport : monthlyReport;
  const summary = selectedReport?.summary || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-slate-400">
          Review workout, nutrition, consistency, and body progress reports.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Workouts</p>
            <Dumbbell className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {overview?.totalWorkouts || 0}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Meals</p>
            <Flame className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {overview?.totalMeals || 0}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Habit Average</p>
            <Target className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {overview?.habitStats?.averageCompletion || 0}%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Weight Change</p>
            <TrendingDown className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {overview?.totalWeightChange || 0}
            <span className="text-base text-slate-400"> kg</span>
          </h2>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Report Filters</h2>
            <p className="text-sm text-slate-400">
              Choose weekly or monthly report period.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("weekly")}
              className={`rounded-xl px-4 py-2 font-semibold ${
                activeTab === "weekly"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Weekly
            </button>

            <button
              onClick={() => setActiveTab("monthly")}
              className={`rounded-xl px-4 py-2 font-semibold ${
                activeTab === "monthly"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <label className="block text-sm text-slate-300 mb-2">
              Weekly Start Date
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />

              <button
                onClick={fetchWeeklyReport}
                disabled={reportLoading}
                className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                Load Week
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
            <label className="block text-sm text-slate-300 mb-2">
              Monthly Report
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="number"
                value={monthFilter.year}
                onChange={(e) =>
                  setMonthFilter((prev) => ({
                    ...prev,
                    year: e.target.value,
                  }))
                }
                className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
                placeholder="2026"
              />

              <select
                value={monthFilter.month}
                onChange={(e) =>
                  setMonthFilter((prev) => ({
                    ...prev,
                    month: e.target.value,
                  }))
                }
                className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              <button
                onClick={fetchMonthlyReport}
                disabled={reportLoading}
                className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                Load Month
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            {activeTab === "weekly" ? (
              <CalendarDays size={22} />
            ) : (
              <BarChart3 size={22} />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold capitalize">
              {activeTab} Report
            </h2>
            <p className="text-sm text-slate-400">
              {selectedReport?.period?.startDate
                ? `${new Date(
                    selectedReport.period.startDate
                  ).toLocaleDateString()} - ${new Date(
                    selectedReport.period.endDate
                  ).toLocaleDateString()}`
                : "No period data"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Calories Consumed</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.totalCaloriesConsumed || 0}
              <span className="text-sm text-slate-400"> kcal</span>
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Protein</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.totalProtein || 0}
              <span className="text-sm text-slate-400"> g</span>
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Calories Burned</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.totalCaloriesBurned || 0}
              <span className="text-sm text-slate-400"> kcal</span>
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Calorie Balance</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.calorieBalance || 0}
              <span className="text-sm text-slate-400"> kcal</span>
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Total Workouts</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.totalWorkouts || 0}
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Workout Duration</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.totalWorkoutDuration || 0}
              <span className="text-sm text-slate-400"> min</span>
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Habit Average</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.habitAverageCompletion || 0}%
            </h3>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Weight Change</p>
            <h3 className="mt-1 text-2xl font-bold">
              {summary.weightChange || 0}
              <span className="text-sm text-slate-400"> kg</span>
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-semibold mb-3">Nutrition Details</h3>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Carbs</span>
                <span>{summary.totalCarbs || 0} g</span>
              </div>
              <div className="flex justify-between">
                <span>Fats</span>
                <span>{summary.totalFats || 0} g</span>
              </div>
              <div className="flex justify-between">
                <span>Protein</span>
                <span>{summary.totalProtein || 0} g</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <h3 className="font-semibold mb-3">Body Progress Details</h3>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Weight Change</span>
                <span>{summary.weightChange || 0} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Waist Change</span>
                <span>{summary.waistChange || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Body Fat Change</span>
                <span>{summary.bodyFatChange || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="font-semibold mb-4">Daily Breakdown</h3>

          {selectedReport?.charts?.dailyBreakdown?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Calories</th>
                    <th className="py-3 pr-4">Protein</th>
                    <th className="py-3 pr-4">Burned</th>
                    <th className="py-3 pr-4">Workout</th>
                    <th className="py-3 pr-4">Habit</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedReport.charts.dailyBreakdown.map((day) => (
                    <tr
                      key={day.date}
                      className="border-b border-slate-900 text-slate-300"
                    >
                      <td className="py-3 pr-4">{day.date}</td>
                      <td className="py-3 pr-4">
                        {day.nutrition?.calories || 0}
                      </td>
                      <td className="py-3 pr-4">
                        {day.nutrition?.protein || 0}g
                      </td>
                      <td className="py-3 pr-4">
                        {day.workout?.caloriesBurned || 0}
                      </td>
                      <td className="py-3 pr-4">
                        {day.workout?.workoutCount || 0}
                      </td>
                      <td className="py-3 pr-4">
                        {day.habitCompletion || 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400">No daily breakdown available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;