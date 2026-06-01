import { useEffect, useState } from "react";
import { Trash2, Scale, Ruler, TrendingDown, Activity } from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const Progress = () => {
  const [progressLogs, setProgressLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [latestProgress, setLatestProgress] = useState(null);

  const [formData, setFormData] = useState({
    date: getTodayDate(),
    weight: "",
    waist: "",
    chest: "",
    arm: "",
    thigh: "",
    hip: "",
    bodyFatPercentage: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("/progress"),
      api.get("/progress/latest"),
      api.get("/progress/summary"),
    ])
      .then(([logsResponse, latestResponse, summaryResponse]) => {
        if (!isMounted) return;

        setProgressLogs(logsResponse.data.progressLogs || []);
        setLatestProgress(latestResponse.data.progress || null);
        setSummary(summaryResponse.data.summary || null);
      })
      .catch((error) => {
        console.error(
          "Progress page fetch error:",
          error.response?.data || error,
        );

        if (isMounted) {
          setError("Failed to load progress data.");
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

  const fetchProgressData = async () => {
    const [logsResponse, latestResponse, summaryResponse] = await Promise.all([
      api.get("/progress"),
      api.get("/progress/latest"),
      api.get("/progress/summary"),
    ]);

    setProgressLogs(logsResponse.data.progressLogs || []);
    setLatestProgress(latestResponse.data.progress || null);
    setSummary(summaryResponse.data.summary || null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      date: getTodayDate(),
      weight: "",
      waist: "",
      chest: "",
      arm: "",
      thigh: "",
      hip: "",
      bodyFatPercentage: "",
      notes: "",
    });
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

      const payload = {
        date: formData.date,
        weight: Number(formData.weight),
        waist: Number(formData.waist) || 0,
        chest: Number(formData.chest) || 0,
        arm: Number(formData.arm) || 0,
        thigh: Number(formData.thigh) || 0,
        hip: Number(formData.hip) || 0,
        bodyFatPercentage: Number(formData.bodyFatPercentage) || 0,
        notes: formData.notes,
      };

      await api.post("/progress", payload);

      await fetchProgressData();

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

    setMessage("");
    setError("");

    try {
      await api.delete(`/progress/${id}`);
      await fetchProgressData();
      setMessage("Progress log deleted successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete progress log.",
      );
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

  const changes = summary?.changes || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Body Progress</h1>
        <p className="text-slate-400">
          Track body weight, measurements, and transformation changes.
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
            <p className="text-sm text-slate-400">Current Weight</p>
            <Scale className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {latestProgress?.weight || "--"}
            <span className="text-base text-slate-400"> kg</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Weight Change</p>
            <TrendingDown className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {changes.weightChange || 0}
            <span className="text-base text-slate-400"> kg</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Waist Change</p>
            <Ruler className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">
            {changes.waistChange || 0}
            <span className="text-base text-slate-400"> inch/cm</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Logs</p>
            <Activity className="text-orange-400" size={22} />
          </div>
          <h2 className="mt-2 text-3xl font-bold">{summary?.totalLogs || 0}</h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-xl font-semibold mb-5">Add Progress Log</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Date</label>
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Body Weight
              </label>
              <input
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="80.5"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Waist</label>
              <input
                name="waist"
                type="number"
                step="0.1"
                value={formData.waist}
                onChange={handleChange}
                placeholder="35"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Chest</label>
              <input
                name="chest"
                type="number"
                step="0.1"
                value={formData.chest}
                onChange={handleChange}
                placeholder="40"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Arm</label>
              <input
                name="arm"
                type="number"
                step="0.1"
                value={formData.arm}
                onChange={handleChange}
                placeholder="13.5"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Thigh</label>
              <input
                name="thigh"
                type="number"
                step="0.1"
                value={formData.thigh}
                onChange={handleChange}
                placeholder="23"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Hip</label>
              <input
                name="hip"
                type="number"
                step="0.1"
                value={formData.hip}
                onChange={handleChange}
                placeholder="39"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Body Fat %
              </label>
              <input
                name="bodyFatPercentage"
                type="number"
                step="0.1"
                value={formData.bodyFatPercentage}
                onChange={handleChange}
                placeholder="25"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm text-slate-300 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Example: One week progress check."
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Progress"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Change Summary</h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Chest Change</p>
              <h3 className="text-2xl font-bold">{changes.chestChange || 0}</h3>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Arm Change</p>
              <h3 className="text-2xl font-bold">{changes.armChange || 0}</h3>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Thigh Change</p>
              <h3 className="text-2xl font-bold">{changes.thighChange || 0}</h3>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Body Fat Change</p>
              <h3 className="text-2xl font-bold">
                {changes.bodyFatChange || 0}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-5">Progress History</h2>

        {progressLogs.length === 0 ? (
          <div className="text-slate-400">No progress logs yet.</div>
        ) : (
          <div className="space-y-4">
            {progressLogs.map((log) => (
              <div
                key={log._id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {new Date(log.date).toLocaleDateString()}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      Weight: {log.weight} kg • Waist: {log.waist || 0} • Body
                      Fat: {log.bodyFatPercentage || 0}%
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300">
                        Chest: {log.chest || 0}
                      </span>
                      <span className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300">
                        Arm: {log.arm || 0}
                      </span>
                      <span className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300">
                        Thigh: {log.thigh || 0}
                      </span>
                      <span className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300">
                        Hip: {log.hip || 0}
                      </span>
                    </div>

                    {log.notes && (
                      <p className="text-sm text-slate-400 mt-3">{log.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(log._id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                    Delete
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
