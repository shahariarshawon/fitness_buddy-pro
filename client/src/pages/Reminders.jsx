import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  Clock,
  Plus,
  Trash2,
  Dumbbell,
  Droplets,
  Utensils,
  Moon,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const reminderTypes = [
  { value: "workout", label: "Workout" },
  { value: "water", label: "Water" },
  { value: "meal", label: "Meal" },
  { value: "sleep", label: "Sleep" },
  { value: "habit", label: "Habit" },
  { value: "custom", label: "Custom" },
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

const getReminderIcon = (type) => {
  if (type === "workout") return Dumbbell;
  if (type === "water") return Droplets;
  if (type === "meal") return Utensils;
  if (type === "sleep") return Moon;
  if (type === "habit") return CheckCircle;
  return Bell;
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [activeReminders, setActiveReminders] = useState([]);

  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.get("/reminders"), api.get("/reminders/active")])
      .then(([allResponse, activeResponse]) => {
        if (!isMounted) return;

        setReminders(allResponse.data.reminders || []);
        setActiveReminders(activeResponse.data.reminders || []);
      })
      .catch((error) => {
        console.error("Reminder page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load reminders.");
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

  const fetchReminders = async () => {
    const [allResponse, activeResponse] = await Promise.all([
      api.get("/reminders"),
      api.get("/reminders/active"),
    ]);

    setReminders(allResponse.data.reminders || []);
    setActiveReminders(activeResponse.data.reminders || []);
  };

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

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!formData.title.trim()) {
        throw new Error("Reminder title is required.");
      }

      if (!formData.time) {
        throw new Error("Reminder time is required.");
      }

      if (formData.frequency === "weekly" && formData.daysOfWeek.length === 0) {
        throw new Error("Please select at least one day for weekly reminders.");
      }

      await api.post("/reminders", formData);

      await fetchReminders();

      resetForm();
      setMessage("Reminder created successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setMessage("");
    setError("");

    try {
      await api.patch(`/reminders/${id}/toggle`);
      await fetchReminders();
      setMessage("Reminder status updated.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update reminder.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      await api.delete(`/reminders/${id}`);
      await fetchReminders();
      setMessage("Reminder deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete reminder.");
    }
  };

 if (loading) {
  return (
    <PageLoader
      title="Loading data"
      message="Please wait while Fitness Buddy Pro prepares your page."
    />
  );
}

  const inactiveCount = reminders.filter((item) => !item.isActive).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="text-slate-400">
          Create reminders for workouts, meals, water, sleep, and daily habits.
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
            <p className="text-sm text-slate-400">Total Reminders</p>
            <Bell className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{reminders.length}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Active</p>
            <Bell className="text-green-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{activeReminders.length}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Inactive</p>
            <BellOff className="text-red-300" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{inactiveCount}</h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Timezone</p>
            <Clock className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-lg font-bold">Asia/Dhaka</h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-xl font-semibold mb-5">Create Reminder</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Evening Workout"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Reminder Type
              </label>
              <select
                name="reminderType"
                value={formData.reminderType}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                {reminderTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {formData.frequency === "weekly" && (
            <div className="mt-5">
              <label className="block text-sm text-slate-300 mb-2">
                Days of Week
              </label>

              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
                      formData.daysOfWeek.includes(day)
                        ? "bg-orange-500 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <label className="block text-sm text-slate-300 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              placeholder="Time to complete your workout today."
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <input
              id="isActive"
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-5 w-5 accent-orange-500"
            />

            <label htmlFor="isActive" className="text-sm text-slate-300">
              Activate reminder immediately
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            <Plus size={18} />
            {saving ? "Saving..." : "Create Reminder"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Reminder Guide</h2>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl bg-slate-800 p-4">
              <strong>Workout:</strong> before gym or exercise time.
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <strong>Water:</strong> every few hours during the day.
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <strong>Meal:</strong> breakfast, lunch, dinner, or snack time.
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <strong>Sleep:</strong> before bedtime routine.
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Note: This page stores reminder settings. Real PWA push/local
            notifications will be connected during the PWA setup stage.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-5">Reminder List</h2>

        {reminders.length === 0 ? (
          <div className="text-slate-400">No reminders created yet.</div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => {
              const Icon = getReminderIcon(reminder.reminderType);

              return (
                <div
                  key={reminder._id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                        <Icon size={22} />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">
                          {reminder.title}
                        </h3>

                        <p className="text-sm text-slate-400 mt-1">
                          {reminder.time} • {reminder.frequency} •{" "}
                          {reminder.reminderType}
                        </p>

                        {reminder.frequency === "weekly" &&
                          reminder.daysOfWeek?.length > 0 && (
                            <p className="text-xs text-slate-500 mt-1 capitalize">
                              Days: {reminder.daysOfWeek.join(", ")}
                            </p>
                          )}

                        {reminder.message && (
                          <p className="text-sm text-slate-300 mt-3">
                            {reminder.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggle(reminder._id)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                          reminder.isActive
                            ? "bg-green-500/10 text-green-300 hover:bg-green-500/20"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {reminder.isActive ? "Active" : "Inactive"}
                      </button>

                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-red-300 hover:bg-red-500/20"
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