import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Dumbbell,
  Flame,
  RefreshCcw,
  Scale,
  Sparkles,
  Target,
  TrendingDown,
  Utensils,
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

const monthNames = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "--";

  const number = Number(value);

  if (Number.isNaN(number)) return "--";

  return number.toFixed(decimals);
};

const formatDate = (dateInput) => {
  if (!dateInput) return "--";

  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatFullDate = (dateInput) => {
  if (!dateInput) return "No period data";

  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDailyBreakdown = (report) => {
  return report?.charts?.dailyBreakdown || report?.dailyBreakdown || [];
};

const StatCard = ({ title, value, suffix, helper, icon: Icon }) => {
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
    </div>
  );
};

const MiniMetric = ({ label, value, suffix, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm text-slate-400">{label}</p>
        <Icon size={17} className="text-[#00c2ad]" />
      </div>

      <p className="text-2xl font-bold">
        {value}
        {suffix && (
          <span className="text-sm font-medium text-slate-400"> {suffix}</span>
        )}
      </p>
    </div>
  );
};

const ChartCard = ({ title, subtitle, icon: Icon, empty, children }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
          <Icon size={21} />
        </div>
      </div>

      {empty ? (
        <div className="flex h-80 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] text-center text-sm text-slate-400">
          No chart data available for this period.
        </div>
      ) : (
        <div className="h-80">{children}</div>
      )}
    </div>
  );
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

  const getReportsPageData = async () => {
    const [weeklyResponse, monthlyResponse, overviewResponse] =
      await Promise.all([
        api.get(`/reports/weekly?startDate=${weekStartDate}`),
        api.get(
          `/reports/monthly?year=${monthFilter.year}&month=${monthFilter.month}`
        ),
        api.get("/reports/overview"),
      ]);

    return {
      weeklyData: weeklyResponse.data.report || null,
      monthlyData: monthlyResponse.data.report || null,
      overviewData: overviewResponse.data.overview || null,
    };
  };

  const applyReportsPageData = ({ weeklyData, monthlyData, overviewData }) => {
    setWeeklyReport(weeklyData);
    setMonthlyReport(monthlyData);
    setOverview(overviewData);
  };

  const refreshReports = async () => {
    setReportLoading(true);
    setError("");

    try {
      const data = await getReportsPageData();
      applyReportsPageData(data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to refresh reports.");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        const data = await getReportsPageData();

        if (!isMounted) return;

        applyReportsPageData(data);
      } catch (error) {
        console.error("Reports fetch error:", error.response?.data || error);

        if (isMounted) {
          setError(error.response?.data?.message || "Failed to load reports.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchWeeklyReport = async () => {
    setReportLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/reports/weekly?startDate=${weekStartDate}`
      );

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
      setError(
        error.response?.data?.message || "Failed to load monthly report."
      );
    } finally {
      setReportLoading(false);
    }
  };

  const selectedReport = activeTab === "weekly" ? weeklyReport : monthlyReport;
  const summary = selectedReport?.summary || {};
  const dailyBreakdown = getDailyBreakdown(selectedReport);

  const chartRows = useMemo(() => {
    return dailyBreakdown.map((day) => ({
      date: formatDate(day.date),
      calories: Number(day.nutrition?.calories || day.calories || 0),
      protein: Number(day.nutrition?.protein || day.protein || 0),
      carbs: Number(day.nutrition?.carbs || day.carbs || 0),
      fats: Number(day.nutrition?.fats || day.fats || 0),
      burned: Number(day.workout?.caloriesBurned || day.caloriesBurned || 0),
      workouts: Number(day.workout?.workoutCount || day.workoutCount || 0),
      habit: Number(day.habitCompletion || day.habit?.completionPercentage || 0),
    }));
  }, [dailyBreakdown]);

  if (loading) {
    return (
      <PageLoader
        title="Loading reports"
        message="Preparing weekly, monthly, nutrition, workout, habit, and body progress reports."
      />
    );
  }

  const reportPeriod =
    selectedReport?.period?.startDate && selectedReport?.period?.endDate
      ? `${formatFullDate(selectedReport.period.startDate)} - ${formatFullDate(
          selectedReport.period.endDate
        )}`
      : "No period data";

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#009587]/20 via-white/[0.04] to-[#00809d]/20 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00c2ad]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#00809d]/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ec]">
              <Sparkles size={14} />
              Transformation Reports
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Review your progress data
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Compare nutrition, workouts, calorie balance, habit consistency,
              and body progress across weekly and monthly periods.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshReports}
            disabled={reportLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              size={16}
              className={reportLoading ? "animate-spin" : ""}
            />
            {reportLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Workouts"
          value={overview?.totalWorkouts || 0}
          helper="All workout records"
          icon={Dumbbell}
        />

        <StatCard
          title="Total Meals"
          value={overview?.totalMeals || 0}
          helper="All meal records"
          icon={Utensils}
        />

        <StatCard
          title="Habit Average"
          value={overview?.habitStats?.averageCompletion || 0}
          suffix="%"
          helper={`${overview?.habitStats?.totalDaysTracked || 0} days tracked`}
          icon={Target}
        />

        <StatCard
          title="Weight Change"
          value={formatNumber(overview?.totalWeightChange, 1)}
          suffix="kg"
          helper="Overall body weight change"
          icon={TrendingDown}
        />
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Report filters
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose a weekly or monthly period and load the report.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("weekly")}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "weekly"
                  ? "bg-gradient-to-r from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/20"
                  : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              Weekly
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("monthly")}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "monthly"
                  ? "bg-gradient-to-r from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/20"
                  : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays size={18} className="text-[#00c2ad]" />
              <h3 className="font-semibold">Weekly report</h3>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />

              <button
                type="button"
                onClick={fetchWeeklyReport}
                disabled={reportLoading}
                className="rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                Load Week
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#00c2ad]" />
              <h3 className="font-semibold">Monthly report</h3>
            </div>

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
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
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
                className="rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                {monthNames.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={fetchMonthlyReport}
                disabled={reportLoading}
                className="rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                Load Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected report */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
              {activeTab === "weekly" ? (
                <CalendarDays size={23} />
              ) : (
                <BarChart3 size={23} />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold capitalize tracking-tight">
                {activeTab} report
              </h2>
              <p className="text-sm text-slate-400">{reportPeriod}</p>
            </div>
          </div>

          <span className="rounded-2xl border border-[#009587]/25 bg-[#009587]/10 px-4 py-2 text-sm font-semibold text-[#9ff7ec] capitalize">
            {activeTab}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric
            label="Calories Consumed"
            value={summary.totalCaloriesConsumed || 0}
            suffix="kcal"
            icon={Flame}
          />

          <MiniMetric
            label="Protein"
            value={summary.totalProtein || 0}
            suffix="g"
            icon={Target}
          />

          <MiniMetric
            label="Calories Burned"
            value={summary.totalCaloriesBurned || 0}
            suffix="kcal"
            icon={Activity}
          />

          <MiniMetric
            label="Calorie Balance"
            value={summary.calorieBalance || 0}
            suffix="kcal"
            icon={BarChart3}
          />

          <MiniMetric
            label="Total Workouts"
            value={summary.totalWorkouts || 0}
            icon={Dumbbell}
          />

          <MiniMetric
            label="Workout Duration"
            value={summary.totalWorkoutDuration || 0}
            suffix="min"
            icon={CalendarDays}
          />

          <MiniMetric
            label="Habit Average"
            value={summary.habitAverageCompletion || 0}
            suffix="%"
            icon={Target}
          />

          <MiniMetric
            label="Weight Change"
            value={formatNumber(summary.weightChange, 1)}
            suffix="kg"
            icon={Scale}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Calories vs Burned"
          subtitle="Daily calorie intake and exercise burn."
          icon={Flame}
          empty={chartRows.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows}>
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
                name="Calories Consumed"
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
          title="Protein & Habit Trend"
          subtitle="Protein intake and habit completion across days."
          icon={Target}
          empty={chartRows.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartRows}>
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
                dataKey="protein"
                name="Protein"
                stroke="#00c2ad"
                strokeWidth={3}
                dot={{ r: 4, fill: "#00c2ad" }}
              />
              <Line
                type="monotone"
                dataKey="habit"
                name="Habit Completion %"
                stroke="#009587"
                strokeWidth={3}
                dot={{ r: 4, fill: "#009587" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detail panels */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <h2 className="text-xl font-semibold tracking-tight">
            Nutrition details
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Macro totals for the selected period.
          </p>

          <div className="mt-5 space-y-3">
            {[
              ["Calories", summary.totalCaloriesConsumed || 0, "kcal"],
              ["Protein", summary.totalProtein || 0, "g"],
              ["Carbs", summary.totalCarbs || 0, "g"],
              ["Fats", summary.totalFats || 0, "g"],
            ].map(([label, value, suffix]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
              >
                <span className="text-sm text-slate-400">{label}</span>
                <span className="font-bold">
                  {value}
                  <span className="text-sm text-slate-400"> {suffix}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <h2 className="text-xl font-semibold tracking-tight">
            Body progress details
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Measurement changes for the selected period.
          </p>

          <div className="mt-5 space-y-3">
            {[
              ["Weight Change", summary.weightChange || 0, "kg"],
              ["Waist Change", summary.waistChange || 0, "cm"],
              ["Body Fat Change", summary.bodyFatChange || 0, "%"],
            ].map(([label, value, suffix]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
              >
                <span className="text-sm text-slate-400">{label}</span>
                <span className="font-bold">
                  {formatNumber(value, 1)}
                  <span className="text-sm text-slate-400"> {suffix}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold tracking-tight">
          Daily breakdown
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Day-by-day summary for the selected report period.
        </p>

        {dailyBreakdown.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No daily breakdown available.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Calories</th>
                  <th className="py-3 pr-4">Protein</th>
                  <th className="py-3 pr-4">Burned</th>
                  <th className="py-3 pr-4">Workouts</th>
                  <th className="py-3 pr-4">Habit</th>
                </tr>
              </thead>

              <tbody>
                {dailyBreakdown.map((day) => (
                  <tr
                    key={day.date}
                    className="border-b border-white/5 text-slate-300"
                  >
                    <td className="py-3 pr-4">{formatDate(day.date)}</td>
                    <td className="py-3 pr-4">
                      {day.nutrition?.calories || day.calories || 0} kcal
                    </td>
                    <td className="py-3 pr-4">
                      {day.nutrition?.protein || day.protein || 0}g
                    </td>
                    <td className="py-3 pr-4">
                      {day.workout?.caloriesBurned ||
                        day.caloriesBurned ||
                        0}{" "}
                      kcal
                    </td>
                    <td className="py-3 pr-4">
                      {day.workout?.workoutCount || day.workoutCount || 0}
                    </td>
                    <td className="py-3 pr-4">
                      {day.habitCompletion ||
                        day.habit?.completionPercentage ||
                        0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;