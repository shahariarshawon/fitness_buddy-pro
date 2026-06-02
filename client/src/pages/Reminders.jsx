import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Droplets,
  Dumbbell,
  Moon,
  RefreshCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const reminderTypes = [
  { value: "workout", label: "Workout", icon: Dumbbell },
  { value: "water", label: "Water", icon: Droplets },
  { value: "meal", label: "Meal", icon: Utensils },
  { value: "sleep", label: "Sleep", icon: Moon },
  { value: "habit", label: "Habit", icon: CheckCircle },
  { value: "custom", label: "Custom", icon: Bell },
];

const weekDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const initialFormData = {
  title: "",
  message: "",
  reminderType: "custom",
  time: "",
  frequency: "daily",
  daysOfWeek: [],
  isActive: true,
  timezone: "Asia/Dhaka",
};

const quickTemplates = [
  {
    title: "Morning Water",
    message: "Start your day with water.",
    reminderType: "water",
    time: "08:00",
    frequency: "daily",
  },
  {
    title: "Lunch Reminder",
    message: "Log your lunch and keep your macros on track.",
    reminderType: "meal",
    time: "13:30",
    frequency: "daily",
  },
  {
    title: "Evening Workout",
    message: "Time to complete today’s workout session.",
    reminderType: "workout",
    time: "18:00",
    frequency: "daily",
  },
  {
    title: "Sleep Shutdown",
    message: "Prepare for sleep and avoid late-night scrolling.",
    reminderType: "sleep",
    time: "23:00",
    frequency: "daily",
  },
];

const getReminderIcon = (type) => {
  const reminderType = reminderTypes.find((item) => item.value === type);
  return reminderType?.icon || Bell;
};

const getTypeClass = (type) => {
  if (type === "workout")
    return "border-[#009587]/30 bg-[#009587]/15 text-[#9ff7ec]";
  if (type === "water")
    return "border-[#00809d]/30 bg-[#00809d]/15 text-[#9ff7ec]";
  if (type === "meal")
    return "border-[#00c2ad]/30 bg-[#00c2ad]/15 text-[#9ff7ec]";
  if (type === "sleep")
    return "border-indigo-400/20 bg-indigo-500/10 text-indigo-200";
  if (type === "habit")
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  return "border-white/10 bg-white/[0.05] text-slate-300";
};

const formatFrequency = (reminder) => {
  if (reminder.frequency === "weekly" && reminder.daysOfWeek?.length > 0) {
    return `${reminder.frequency} • ${reminder.daysOfWeek
      .map((day) => day.slice(0, 3))
      .join(", ")}`;
  }

  if (reminder.frequency === "custom" && reminder.daysOfWeek?.length > 0) {
    return `custom • ${reminder.daysOfWeek
      .map((day) => day.slice(0, 3))
      .join(", ")}`;
  }

  return reminder.frequency || "daily";
};

const StatCard = ({ title, value, helper, icon: Icon }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#009587]/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{value}</h2>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [activeReminders, setActiveReminders] = useState([]);

  const [formData, setFormData] = useState(initialFormData);

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getReminderPageData = async () => {
    const [allResponse, activeResponse] = await Promise.all([
      api.get("/reminders"),
      api.get("/reminders/active"),
    ]);

    return {
      remindersData: allResponse.data.reminders || [],
      activeRemindersData: activeResponse.data.reminders || [],
    };
  };

  const applyReminderPageData = ({ remindersData, activeRemindersData }) => {
    setReminders(remindersData);
    setActiveReminders(activeRemindersData);
  };

  const refreshReminders = async () => {
    const data = await getReminderPageData();
    applyReminderPageData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadReminders = async () => {
      try {
        const data = await getReminderPageData();

        if (!isMounted) return;

        applyReminderPageData(data);
      } catch (error) {
        console.error(
          "Reminder page fetch error:",
          error.response?.data || error,
        );

        if (isMounted) {
          setError(
            error.response?.data?.message || "Failed to load reminders.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReminders();

    return () => {
      isMounted = false;
    };
  }, []);

  const inactiveCount = useMemo(() => {
    return reminders.filter((item) => !item.isActive).length;
  }, [reminders]);

  const reminderStats = useMemo(() => {
    return {
      total: reminders.length,
      active: activeReminders.length,
      inactive: inactiveCount,
      daily: reminders.filter((item) => item.frequency === "daily").length,
    };
  }, [reminders, activeReminders, inactiveCount]);

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const matchesSearch =
        reminder.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "all" || reminder.reminderType === filterType;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && reminder.isActive) ||
        (filterStatus === "inactive" && !reminder.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [reminders, searchTerm, filterType, filterStatus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const alreadySelected = prev.daysOfWeek.includes(day);

      return {
        ...prev,
        daysOfWeek: alreadySelected
          ? prev.daysOfWeek.filter((item) => item !== day)
          : [...prev.daysOfWeek, day],
      };
    });
  };

  const applyTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      ...template,
      isActive: true,
      timezone: prev.timezone || "Asia/Dhaka",
      daysOfWeek: template.daysOfWeek || [],
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const buildPayload = () => {
    const payload = {
      ...formData,
      title: formData.title.trim(),
      message: formData.message.trim(),
      timezone: formData.timezone || "Asia/Dhaka",
    };

    if (payload.frequency === "daily") {
      payload.daysOfWeek = [];
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = buildPayload();

      if (!payload.title) {
        throw new Error("Reminder title is required.");
      }

      if (!payload.time) {
        throw new Error("Reminder time is required.");
      }

      if (
        ["weekly", "custom"].includes(payload.frequency) &&
        payload.daysOfWeek.length === 0
      ) {
        throw new Error(
          "Please select at least one day for weekly/custom reminders.",
        );
      }

      await api.post("/reminders", payload);

      await refreshReminders();

      resetForm();
      setMessage("Reminder created successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create reminder.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setActionLoadingId(id);
    setMessage("");
    setError("");

    try {
      await api.patch(`/reminders/${id}/toggle`);
      await refreshReminders();
      setMessage("Reminder status updated.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update reminder.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reminder?",
    );

    if (!confirmDelete) return;

    setActionLoadingId(id);
    setMessage("");
    setError("");

    try {
      await api.delete(`/reminders/${id}`);
      await refreshReminders();
      setMessage("Reminder deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete reminder.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading reminders"
        message="Preparing workout, meal, water, sleep, and habit reminders."
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
              Reminder System
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Build daily consistency
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Create reminders for workouts, meals, water, sleep, habits, and
              custom transformation tasks.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshReminders}
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Reminders"
          value={reminderStats.total}
          helper="All created reminders"
          icon={Bell}
        />

        <StatCard
          title="Active"
          value={reminderStats.active}
          helper="Currently enabled"
          icon={CheckCircle}
        />

        <StatCard
          title="Inactive"
          value={reminderStats.inactive}
          helper="Disabled reminders"
          icon={BellOff}
        />

        <StatCard
          title="Daily"
          value={reminderStats.daily}
          helper="Repeats every day"
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Create form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Create reminder
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Saved reminders can later be used for PWA push/local
                notifications.
              </p>
            </div>

            <span
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold capitalize ${getTypeClass(
                formData.reminderType,
              )}`}
            >
              {formData.reminderType}
            </span>
          </div>

          {/* Quick templates */}
          <div className="mb-5">
            <p className="mb-3 text-sm font-semibold text-slate-300">
              Quick templates
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {quickTemplates.map((template) => {
                const Icon = getReminderIcon(template.reminderType);

                return (
                  <button
                    key={template.title}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-[#009587]/30 hover:bg-white/[0.06]"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec]">
                      <Icon size={18} />
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {template.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {template.time} • {template.reminderType}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Evening Workout"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Reminder type
              </label>
              <select
                name="reminderType"
                value={formData.reminderType}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                {reminderTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Timezone
              </label>
              <input
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                placeholder="Asia/Dhaka"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 accent-[#009587]"
              />

              <span className="text-sm text-slate-300">
                Activate reminder immediately
              </span>
            </label>
          </div>

          {["weekly", "custom"].includes(formData.frequency) && (
            <div className="mt-5">
              <label className="mb-2 block text-sm text-slate-300">
                Days of week
              </label>

              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${
                      formData.daysOfWeek.includes(day)
                        ? "bg-gradient-to-r from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/20"
                        : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              placeholder="Time to complete your workout today."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Create Reminder"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Guide */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Reminder guide
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Suggested use for your transformation system.
            </p>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              {[
                ["Workout", "Before gym, walk, cardio, or mobility session."],
                ["Water", "Every few hours to reach daily water target."],
                ["Meal", "Breakfast, lunch, dinner, snack, or protein meal."],
                ["Sleep", "Before bedtime routine and phone shutdown."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <strong className="text-[#9ff7ec]">{title}:</strong> {text}
                </div>
              ))}
            </div>

            <p className="mt-4 rounded-2xl border border-[#009587]/20 bg-[#009587]/10 p-4 text-xs leading-5 text-[#9ff7ec]">
              Note: This page stores reminder settings. Real PWA push or local
              notifications can be connected during the PWA setup stage.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Active reminders
            </h2>

            {activeReminders.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
                No active reminders.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {activeReminders.slice(0, 5).map((reminder) => {
                  const Icon = getReminderIcon(reminder.reminderType);

                  return (
                    <div
                      key={reminder._id}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec]">
                        <Icon size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {reminder.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {reminder.time} • {reminder.reminderType}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Reminder list
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage active and inactive reminders.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reminders"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-11 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10 sm:w-64"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
            >
              <option value="all">All types</option>
              {reminderTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {filteredReminders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No reminders found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => {
              const Icon = getReminderIcon(reminder.reminderType);

              return (
                <div
                  key={reminder._id}
                  className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
                        <Icon size={22} />
                      </div>

                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {reminder.title}
                          </h3>

                          <span
                            className={`rounded-xl border px-3 py-1 text-xs font-semibold capitalize ${getTypeClass(
                              reminder.reminderType,
                            )}`}
                          >
                            {reminder.reminderType}
                          </span>

                          <span
                            className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                              reminder.isActive
                                ? "bg-[#009587]/15 text-[#9ff7ec]"
                                : "bg-white/[0.05] text-slate-400"
                            }`}
                          >
                            {reminder.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-400">
                          {reminder.time} • {formatFrequency(reminder)} •{" "}
                          {reminder.timezone || "Asia/Dhaka"}
                        </p>

                        {reminder.message && (
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            {reminder.message}
                          </p>
                        )}

                        {reminder.lastTriggeredAt && (
                          <p className="mt-2 text-xs text-slate-500">
                            Last triggered:{" "}
                            {new Date(
                              reminder.lastTriggeredAt,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(reminder._id)}
                        disabled={actionLoadingId === reminder._id}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                          reminder.isActive
                            ? "bg-[#009587]/15 text-[#9ff7ec] hover:bg-[#009587]/20"
                            : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                        }`}
                      >
                        {reminder.isActive ? (
                          <Bell size={16} />
                        ) : (
                          <BellOff size={16} />
                        )}
                        {actionLoadingId === reminder._id
                          ? "Updating..."
                          : reminder.isActive
                            ? "Active"
                            : "Inactive"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(reminder._id)}
                        disabled={actionLoadingId === reminder._id}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;
