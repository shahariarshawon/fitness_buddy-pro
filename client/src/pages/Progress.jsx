import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle,
  HeartPulse,
  LineChart as LineChartIcon,
  RefreshCcw,
  Ruler,
  Save,
  Scale,
  Sparkles,
  Star,
  Trash2,
  TrendingDown,
} from "lucide-react";
import {
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

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const defaultFormData = {
  date: getTodayDate(),

  weight: "",
  weightUnit: "kg",
  measurementUnit: "cm",

  heightCm: "",
  waist: "",
  chest: "",
  arm: "",
  thigh: "",
  hip: "",
  neck: "",
  shoulder: "",
  calf: "",
  bodyFatPercentage: "",

  weekNumber: "",
  checkInType: "daily",
  isWeeklyCheckIn: false,
  isStartMeasurement: false,
  isFinalMeasurement: false,

  averageSteps: "",
  workoutsCompleted: "",
  proteinDays: "",
  sleepRating: "",
  energyRating: "",
  moodRating: "",

  progressStatus: "",
  notes: "",
};

const numberFields = [
  "weight",
  "heightCm",
  "waist",
  "chest",
  "arm",
  "thigh",
  "hip",
  "neck",
  "shoulder",
  "calf",
  "bodyFatPercentage",
  "weekNumber",
  "averageSteps",
  "workoutsCompleted",
  "proteinDays",
  "sleepRating",
  "energyRating",
  "moodRating",
];

const formatNumber = (value, decimals = 1) => {
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
    year: "numeric",
  });
};

const getPhotoUrl = (photo) => {
  return (
    photo?.medium?.url ||
    photo?.thumbnail?.url ||
    photo?.original?.url ||
    photo?.imageUrl ||
    ""
  );
};

const getStatusClass = (status) => {
  if (status === "excellent") {
    return "border-[#009587]/30 bg-[#009587]/15 text-[#9ff7ec]";
  }

  if (status === "on_track") {
    return "border-[#00809d]/30 bg-[#00809d]/15 text-[#9ff7ec]";
  }

  if (status === "plateau") {
    return "border-yellow-400/20 bg-yellow-500/10 text-yellow-100";
  }

  if (status === "needs_adjustment") {
    return "border-red-400/20 bg-red-500/10 text-red-200";
  }

  return "border-white/10 bg-white/[0.05] text-slate-300";
};

const buildCleanPayload = (formData) => {
  const payload = { ...formData };

  numberFields.forEach((field) => {
    if (payload[field] === "" || payload[field] === null) {
      delete payload[field];
    } else {
      payload[field] = Number(payload[field]);
    }
  });

  if (!payload.progressStatus) {
    delete payload.progressStatus;
  }

  if (!payload.notes.trim()) {
    delete payload.notes;
  }

  return payload;
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

const Field = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  step,
  min,
  max,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
      />
    </div>
  );
};

const SelectField = ({ label, name, value, onChange, children }) => {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
      >
        {children}
      </select>
    </div>
  );
};

const ToggleCard = ({ label, description, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-[#009587]/40 bg-[#009587]/15 text-[#9ff7ec]"
          : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-start gap-3">
        <CheckCircle
          size={18}
          className={active ? "text-[#9ff7ec]" : "text-slate-500"}
        />

        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </button>
  );
};

const Progress = () => {
  const [progressLogs, setProgressLogs] = useState([]);
  const [weeklyCheckIns, setWeeklyCheckIns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [latestProgress, setLatestProgress] = useState(null);
  const [chartData, setChartData] = useState([]);

  const [formData, setFormData] = useState(defaultFormData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getProgressPageData = async () => {
    const [logsResponse, latestResponse, summaryResponse, weeklyResponse] =
      await Promise.all([
        api.get("/progress?limit=30"),
        api.get("/progress/latest"),
        api.get("/progress/summary"),
        api.get("/progress/checkins/weekly").catch(() => ({
          data: { checkIns: [] },
        })),
      ]);

    return {
      logsData: logsResponse.data.progressLogs || [],
      latestData: latestResponse.data.progress || null,
      summaryData: summaryResponse.data.summary || null,
      chartDataResponse: summaryResponse.data.charts?.progress || [],
      weeklyData: weeklyResponse.data.checkIns || [],
    };
  };

  const applyProgressPageData = ({
    logsData,
    latestData,
    summaryData,
    chartDataResponse,
    weeklyData,
  }) => {
    setProgressLogs(logsData);
    setLatestProgress(latestData);
    setSummary(summaryData);
    setChartData(chartDataResponse);
    setWeeklyCheckIns(weeklyData);
  };

  const refreshProgressData = async () => {
    const data = await getProgressPageData();
    applyProgressPageData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      try {
        const data = await getProgressPageData();

        if (!isMounted) return;

        applyProgressPageData(data);
      } catch (error) {
        console.error(
          "Progress page fetch error:",
          error.response?.data || error,
        );

        if (isMounted) {
          setError(
            error.response?.data?.message || "Failed to load progress data.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  const changes = summary?.changes || {};

  const measurementUnit =
    latestProgress?.measurementUnit || formData.measurementUnit || "cm";

  const weightUnit = latestProgress?.weightUnit || formData.weightUnit || "kg";

  const chartRows = useMemo(() => {
    const source = chartData.length > 0 ? chartData : progressLogs;

    return source
      .slice()
      .reverse()
      .map((item) => ({
        date: formatDate(item.date),
        weight: Number(item.weight || 0),
        waist: Number(item.waist || 0),
        bodyFatPercentage: Number(item.bodyFatPercentage || 0),
        bmi: Number(item.bmi || 0),
      }));
  }, [chartData, progressLogs]);

  const latestPhotos = useMemo(() => {
    const photos = latestProgress?.photos || {};

    return [
      {
        type: "Front",
        photo: photos.frontPhoto,
      },
      {
        type: "Side",
        photo: photos.sidePhoto,
      },
      {
        type: "Back",
        photo: photos.backPhoto,
      },
    ].filter((item) => item.photo && getPhotoUrl(item.photo));
  }, [latestProgress]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!formData.weight) {
        throw new Error("Body weight is required.");
      }

      const payload = buildCleanPayload(formData);

      if (payload.checkInType === "weekly" || payload.isWeeklyCheckIn) {
        payload.isWeeklyCheckIn = true;
        payload.checkInType = "weekly";

        await api.post("/progress/checkins/weekly", payload);
      } else {
        await api.post("/progress", payload);
      }

      await refreshProgressData();

      resetForm();
      setMessage("Progress log saved successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save progress log.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this progress log?",
    );

    if (!confirmDelete) return;

    setDeletingId(id);
    setMessage("");
    setError("");

    try {
      await api.delete(`/progress/${id}`);
      await refreshProgressData();
      setMessage("Progress log deleted successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete progress log.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading progress"
        message="Preparing body measurements, weekly check-ins, charts, and summary."
      />
    );
  }

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
              Body Progress Tracker
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Track body transformation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Record weight, BMI, measurements, body fat, weekly check-ins,
              progress status, and transformation photos in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshProgressData}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
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

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Current Weight"
          value={formatNumber(latestProgress?.weight, 1)}
          suffix={latestProgress?.weight ? weightUnit : ""}
          helper="Latest body weight"
          icon={Scale}
        />

        <StatCard
          title="Weight Change"
          value={formatNumber(changes.weightChange, 1)}
          suffix={weightUnit}
          helper="Latest vs first log"
          icon={TrendingDown}
        />

        <StatCard
          title="Waist Change"
          value={formatNumber(changes.waistChange, 1)}
          suffix={measurementUnit}
          helper="Core body change"
          icon={Ruler}
        />

        <StatCard
          title="BMI"
          value={formatNumber(latestProgress?.bmi, 1)}
          helper="Auto-calculated if height is available"
          icon={HeartPulse}
        />

        <StatCard
          title="Total Logs"
          value={summary?.totalLogs || 0}
          helper={`${weeklyCheckIns.length || 0} weekly check-ins`}
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Add progress log
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Use daily logs for regular weight and weekly check-ins for
                deeper transformation tracking.
              </p>
            </div>

            <span
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold capitalize ${getStatusClass(
                formData.progressStatus,
              )}`}
            >
              {formData.progressStatus
                ? formData.progressStatus.replace("_", " ")
                : "new log"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />

            <SelectField
              label="Check-in type"
              name="checkInType"
              value={formData.checkInType}
              onChange={(e) => {
                const value = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  checkInType: value,
                  isWeeklyCheckIn: value === "weekly",
                  isStartMeasurement: value === "start",
                  isFinalMeasurement: value === "final",
                }));
              }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="start">Start</option>
              <option value="final">Final</option>
              <option value="custom">Custom</option>
            </SelectField>

            <Field
              label="Week number"
              name="weekNumber"
              type="number"
              value={formData.weekNumber}
              onChange={handleChange}
              min="1"
              placeholder="1"
            />

            <SelectField
              label="Progress status"
              name="progressStatus"
              value={formData.progressStatus}
              onChange={handleChange}
            >
              <option value="">Select status</option>
              <option value="excellent">Excellent</option>
              <option value="on_track">On track</option>
              <option value="plateau">Plateau</option>
              <option value="needs_adjustment">Needs adjustment</option>
            </SelectField>

            <Field
              label="Body weight"
              name="weight"
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={handleChange}
              placeholder="80.5"
            />

            <SelectField
              label="Weight unit"
              name="weightUnit"
              value={formData.weightUnit}
              onChange={handleChange}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </SelectField>

            <Field
              label="Height, cm"
              name="heightCm"
              type="number"
              step="0.1"
              min="0"
              value={formData.heightCm}
              onChange={handleChange}
              placeholder="175"
            />

            <SelectField
              label="Measurement unit"
              name="measurementUnit"
              value={formData.measurementUnit}
              onChange={handleChange}
            >
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </SelectField>

            <Field
              label="Waist"
              name="waist"
              type="number"
              step="0.1"
              min="0"
              value={formData.waist}
              onChange={handleChange}
              placeholder="90"
            />

            <Field
              label="Chest"
              name="chest"
              type="number"
              step="0.1"
              min="0"
              value={formData.chest}
              onChange={handleChange}
              placeholder="100"
            />

            <Field
              label="Arm"
              name="arm"
              type="number"
              step="0.1"
              min="0"
              value={formData.arm}
              onChange={handleChange}
              placeholder="35"
            />

            <Field
              label="Thigh"
              name="thigh"
              type="number"
              step="0.1"
              min="0"
              value={formData.thigh}
              onChange={handleChange}
              placeholder="58"
            />

            <Field
              label="Hip"
              name="hip"
              type="number"
              step="0.1"
              min="0"
              value={formData.hip}
              onChange={handleChange}
              placeholder="98"
            />

            <Field
              label="Neck"
              name="neck"
              type="number"
              step="0.1"
              min="0"
              value={formData.neck}
              onChange={handleChange}
              placeholder="38"
            />

            <Field
              label="Shoulder"
              name="shoulder"
              type="number"
              step="0.1"
              min="0"
              value={formData.shoulder}
              onChange={handleChange}
              placeholder="115"
            />

            <Field
              label="Calf"
              name="calf"
              type="number"
              step="0.1"
              min="0"
              value={formData.calf}
              onChange={handleChange}
              placeholder="38"
            />

            <Field
              label="Body fat %"
              name="bodyFatPercentage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.bodyFatPercentage}
              onChange={handleChange}
              placeholder="25"
            />

            <Field
              label="Average steps"
              name="averageSteps"
              type="number"
              min="0"
              value={formData.averageSteps}
              onChange={handleChange}
              placeholder="8000"
            />

            <Field
              label="Workouts completed"
              name="workoutsCompleted"
              type="number"
              min="0"
              value={formData.workoutsCompleted}
              onChange={handleChange}
              placeholder="5"
            />

            <Field
              label="Protein days"
              name="proteinDays"
              type="number"
              min="0"
              value={formData.proteinDays}
              onChange={handleChange}
              placeholder="6"
            />

            <Field
              label="Sleep rating, 1-10"
              name="sleepRating"
              type="number"
              min="1"
              max="10"
              value={formData.sleepRating}
              onChange={handleChange}
            />

            <Field
              label="Energy rating, 1-10"
              name="energyRating"
              type="number"
              min="1"
              max="10"
              value={formData.energyRating}
              onChange={handleChange}
            />

            <Field
              label="Mood rating, 1-10"
              name="moodRating"
              type="number"
              min="1"
              max="10"
              value={formData.moodRating}
              onChange={handleChange}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ToggleCard
              label="Weekly check-in"
              description="Save through weekly check-in endpoint"
              active={formData.isWeeklyCheckIn}
              onClick={() => handleToggle("isWeeklyCheckIn")}
            />

            <ToggleCard
              label="Start measurement"
              description="Use as before/start baseline"
              active={formData.isStartMeasurement}
              onClick={() => handleToggle("isStartMeasurement")}
            />

            <ToggleCard
              label="Final measurement"
              description="Use as after/final result"
              active={formData.isFinalMeasurement}
              onClick={() => handleToggle("isFinalMeasurement")}
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Example: Week 4 check-in, waist reduced, energy improved."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Progress"}
          </button>
        </form>

        {/* Side summary */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Change summary
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              First log compared with latest log.
            </p>

            <div className="mt-5 space-y-3">
              {[
                ["Chest", changes.chestChange, measurementUnit],
                ["Arm", changes.armChange, measurementUnit],
                ["Thigh", changes.thighChange, measurementUnit],
                ["Hip", changes.hipChange, measurementUnit],
                ["Neck", changes.neckChange, measurementUnit],
                ["Shoulder", changes.shoulderChange, measurementUnit],
                ["Calf", changes.calfChange, measurementUnit],
                ["Body Fat", changes.bodyFatChange, "%"],
                ["BMI", changes.bmiChange, ""],
              ].map(([label, value, suffix]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4"
                >
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className="font-bold">
                    {formatNumber(value, 1)}
                    {suffix && (
                      <span className="text-sm text-slate-400"> {suffix}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Latest photos
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Photos linked with the latest progress log.
            </p>

            {latestPhotos.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                No linked photos yet.
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-3">
                {latestPhotos.map((item) => (
                  <div
                    key={item.type}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                  >
                    <img
                      src={getPhotoUrl(item.photo)}
                      alt={item.type}
                      className="h-28 w-full object-cover"
                    />
                    <div className="p-2 text-center text-xs font-semibold text-slate-300">
                      {item.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Progress trend
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Weight, waist, body fat, and BMI trend from progress logs.
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
            <LineChartIcon size={21} />
          </div>
        </div>

        {chartRows.length === 0 ? (
          <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] text-center text-sm text-slate-400">
            No chart data yet.
          </div>
        ) : (
          <div className="h-80">
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
                <Line
                  type="monotone"
                  dataKey="bodyFatPercentage"
                  name="Body Fat %"
                  stroke="#009587"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#009587" }}
                />
                <Line
                  type="monotone"
                  dataKey="bmi"
                  name="BMI"
                  stroke="#9ff7ec"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#9ff7ec" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Weekly check-ins */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Weekly check-ins
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Dedicated weekly progress entries.
            </p>
          </div>

          <Star size={22} className="text-[#00c2ad]" />
        </div>

        {weeklyCheckIns.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No weekly check-ins yet.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {weeklyCheckIns.slice(0, 6).map((checkIn) => (
              <div
                key={checkIn._id}
                className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Week {checkIn.weekNumber || "--"} Check-in
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatDate(checkIn.date)} • {checkIn.weight || "--"}{" "}
                      {checkIn.weightUnit || "kg"} • Waist{" "}
                      {checkIn.waist || "--"} {checkIn.measurementUnit || "cm"}
                    </p>
                  </div>

                  <span
                    className={`rounded-2xl border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                      checkIn.progressStatus,
                    )}`}
                  >
                    {checkIn.progressStatus?.replace("_", " ") || "check-in"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-xs text-slate-400">Steps</p>
                    <p className="font-bold">{checkIn.averageSteps || "--"}</p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-xs text-slate-400">Workouts</p>
                    <p className="font-bold">
                      {checkIn.workoutsCompleted || "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.04] p-3">
                    <p className="text-xs text-slate-400">Protein Days</p>
                    <p className="font-bold">{checkIn.proteinDays || "--"}</p>
                  </div>
                </div>

                {checkIn.notes && (
                  <p className="mt-3 text-sm text-slate-400">{checkIn.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold tracking-tight">
          Progress history
        </h2>

        {progressLogs.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No progress logs yet.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {progressLogs.map((log) => (
              <div
                key={log._id}
                className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {formatDate(log.date)}
                      </h3>

                      <span
                        className={`rounded-xl border px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          log.progressStatus,
                        )}`}
                      >
                        {log.progressStatus?.replace("_", " ") ||
                          log.checkInType ||
                          "daily"}
                      </span>

                      {log.isWeeklyCheckIn && (
                        <span className="rounded-xl bg-[#009587]/15 px-3 py-1 text-xs font-semibold text-[#9ff7ec]">
                          Weekly
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400">
                      Weight: {log.weight || "--"} {log.weightUnit || "kg"} •
                      Waist: {log.waist || "--"} {log.measurementUnit || "cm"} •
                      Body Fat: {log.bodyFatPercentage || "--"}% • BMI:{" "}
                      {log.bmi || "--"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        ["Chest", log.chest],
                        ["Arm", log.arm],
                        ["Thigh", log.thigh],
                        ["Hip", log.hip],
                        ["Neck", log.neck],
                        ["Shoulder", log.shoulder],
                        ["Calf", log.calf],
                      ].map(([label, value]) => (
                        <span
                          key={label}
                          className="rounded-xl bg-white/[0.05] px-3 py-1 text-sm text-slate-300"
                        >
                          {label}: {value || "--"}
                        </span>
                      ))}
                    </div>

                    {log.notes && (
                      <p className="mt-3 text-sm text-slate-400">{log.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(log._id)}
                    disabled={deletingId === log._id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    {deletingId === log._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
