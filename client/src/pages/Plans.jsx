import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Dumbbell,
  Flame,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Target,
  Trash2,
  Utensils,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const defaultPlanForm = {
  name: "",
  goalType: "fat_loss",
  durationWeeks: 12,
  startDate: getTodayDate(),

  weeklyWorkoutDays: 5,
  dailyCalorieTarget: 2000,
  dailyProteinTarget: 140,
  dailyWaterTarget: 3,
  dailyStepsTarget: 8000,
  dailySleepTarget: 8,

  trainingLocation: "gym",
  cardioPreference: "incline_walk",
  foodPreference: "regular_scales",
  notes: "",
};

const formatDate = (dateInput) => {
  if (!dateInput) return "--";

  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getStatusClass = (status, isActive) => {
  if (isActive || status === "active") {
    return "border-[#009587]/30 bg-[#009587]/15 text-[#9ff7ec]";
  }

  if (status === "completed") {
    return "border-[#00809d]/30 bg-[#00809d]/15 text-[#9ff7ec]";
  }

  if (status === "paused") {
    return "border-yellow-400/20 bg-yellow-500/10 text-yellow-200";
  }

  return "border-white/10 bg-white/[0.05] text-slate-300";
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

const PlanMetric = ({ label, value, suffix, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">{label}</p>
        <Icon size={16} className="text-[#00c2ad]" />
      </div>

      <p className="text-lg font-bold">
        {value ?? "--"}
        {suffix && (
          <span className="text-sm font-medium text-slate-400"> {suffix}</span>
        )}
      </p>
    </div>
  );
};

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [backendMissing, setBackendMissing] = useState(false);

  const [formData, setFormData] = useState(defaultPlanForm);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getPlansPageData = async () => {
    try {
      const [plansResponse, activePlanResponse] = await Promise.all([
        api.get("/plans"),
        api.get("/plans/active"),
      ]);

      return {
        plansData: safeArray(plansResponse.data.plans),
        activePlanData:
          activePlanResponse.data.plan ||
          activePlanResponse.data.activePlan ||
          null,
        backendMissingData: false,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          plansData: [],
          activePlanData: null,
          backendMissingData: true,
        };
      }

      throw error;
    }
  };

  const applyPlansData = ({ plansData, activePlanData, backendMissingData }) => {
    setPlans(plansData);
    setActivePlan(activePlanData);
    setBackendMissing(backendMissingData);
  };

  const refreshPlans = async () => {
    const data = await getPlansPageData();
    applyPlansData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadPlans = async () => {
      try {
        const data = await getPlansPageData();

        if (!isMounted) return;

        applyPlansData(data);
      } catch (error) {
        console.error("Plans page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError(error.response?.data?.message || "Failed to load plans.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  const planStats = useMemo(() => {
    const active = plans.filter((plan) => plan.isActive || plan.status === "active");
    const completed = plans.filter((plan) => plan.status === "completed");
    const paused = plans.filter((plan) => plan.status === "paused");

    return {
      total: plans.length,
      active: active.length,
      completed: completed.length,
      paused: paused.length,
    };
  }, [plans]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const buildPlanPayload = () => {
    return {
      name: formData.name.trim(),
      goalType: formData.goalType,
      durationWeeks: Number(formData.durationWeeks || 12),
      startDate: formData.startDate,

      weeklyWorkoutDays: Number(formData.weeklyWorkoutDays || 5),

      targets: {
        calories: Number(formData.dailyCalorieTarget || 2000),
        protein: Number(formData.dailyProteinTarget || 140),
        waterLiters: Number(formData.dailyWaterTarget || 3),
        steps: Number(formData.dailyStepsTarget || 8000),
        sleepHours: Number(formData.dailySleepTarget || 8),
      },

      preferences: {
        trainingLocation: formData.trainingLocation,
        cardioPreference: formData.cardioPreference,
        foodPreference: formData.foodPreference,
      },

      notes: formData.notes,
    };
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = buildPlanPayload();

      if (!payload.name) {
        throw new Error("Plan name is required.");
      }

      await api.post("/plans", payload);

      await refreshPlans();

      setFormData(defaultPlanForm);
      setShowCreateForm(false);
      setMessage("Plan created successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Failed to create plan."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleActivatePlan = async (planId) => {
    setActionLoadingId(planId);
    setMessage("");
    setError("");

    try {
      await api.patch(`/plans/${planId}/activate`);
      await refreshPlans();
      setMessage("Plan activated successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to activate plan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePlan = async (planId) => {
    const confirmDelete = window.confirm("Delete this plan?");

    if (!confirmDelete) return;

    setActionLoadingId(planId);
    setMessage("");
    setError("");

    try {
      await api.delete(`/plans/${planId}`);
      await refreshPlans();
      setMessage("Plan deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete plan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading plans"
        message="Preparing your transformation plans and active plan status."
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
              Transformation Plans
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Plan your transformation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Create a structured plan with workout days, calorie targets,
              protein targets, water, steps, sleep, and preferences for your
              daily system.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshPlans}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] active:scale-[0.98]"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={16} />
              {showCreateForm ? "Close Form" : "Create Plan"}
            </button>
          </div>
        </div>
      </div>

      {backendMissing && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          <div className="flex gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>
              Plan backend routes are not connected yet. This page is ready for
              the frontend, but it needs <strong>/api/plans</strong> routes to
              create, activate, and manage plans.
            </p>
          </div>
        </div>
      )}

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
          title="Total Plans"
          value={planStats.total}
          helper="All transformation plans"
          icon={CalendarDays}
        />

        <StatCard
          title="Active Plans"
          value={planStats.active}
          helper="Currently running"
          icon={CheckCircle}
        />

        <StatCard
          title="Completed"
          value={planStats.completed}
          helper="Finished plans"
          icon={Target}
        />

        <StatCard
          title="Paused"
          value={planStats.paused}
          helper="Paused plans"
          icon={Activity}
        />
      </div>

      {/* Active plan */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-400">Active plan</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              {activePlan?.name || "No active plan yet"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {activePlan
                ? `${formatDate(activePlan.startDate)} - ${formatDate(
                    activePlan.endDate
                  )}`
                : "Create or activate a plan to connect it with Today and Dashboard."}
            </p>
          </div>

          <Link
            to="/today"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
          >
            Open Today
            <ArrowRight size={16} />
          </Link>
        </div>

        {activePlan ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <PlanMetric
              label="Goal"
              value={activePlan.goalType?.replace("_", " ") || "--"}
              icon={Target}
            />
            <PlanMetric
              label="Duration"
              value={activePlan.durationWeeks || "--"}
              suffix="weeks"
              icon={CalendarDays}
            />
            <PlanMetric
              label="Calories"
              value={activePlan.targets?.calories || activePlan.dailyCalorieTarget}
              suffix="kcal"
              icon={Flame}
            />
            <PlanMetric
              label="Protein"
              value={activePlan.targets?.protein || activePlan.dailyProteinTarget}
              suffix="g"
              icon={Utensils}
            />
            <PlanMetric
              label="Workout Days"
              value={activePlan.weeklyWorkoutDays || "--"}
              suffix="/ week"
              icon={Dumbbell}
            />
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-lg font-semibold text-slate-200">
              No active plan selected
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Create a plan below, then activate it to use it in the Today page.
            </p>
          </div>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreatePlan}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
        >
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight">
              Create transformation plan
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              These fields match the upgraded backend concept: plan, targets,
              preferences, and later PlanDay generation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Plan name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="12 Week Fat Loss Plan"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Goal type
              </label>
              <select
                name="goalType"
                value={formData.goalType}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="fat_loss">Fat loss</option>
                <option value="muscle_gain">Muscle gain</option>
                <option value="recomposition">Recomposition</option>
                <option value="maintenance">Maintenance</option>
                <option value="general_fitness">General fitness</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Start date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Duration weeks
              </label>
              <input
                type="number"
                name="durationWeeks"
                value={formData.durationWeeks}
                onChange={handleInputChange}
                min="1"
                max="52"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Workout days/week
              </label>
              <input
                type="number"
                name="weeklyWorkoutDays"
                value={formData.weeklyWorkoutDays}
                onChange={handleInputChange}
                min="0"
                max="7"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Daily calories
              </label>
              <input
                type="number"
                name="dailyCalorieTarget"
                value={formData.dailyCalorieTarget}
                onChange={handleInputChange}
                min="0"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Daily protein, g
              </label>
              <input
                type="number"
                name="dailyProteinTarget"
                value={formData.dailyProteinTarget}
                onChange={handleInputChange}
                min="0"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Water, L
              </label>
              <input
                type="number"
                name="dailyWaterTarget"
                value={formData.dailyWaterTarget}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Steps
              </label>
              <input
                type="number"
                name="dailyStepsTarget"
                value={formData.dailyStepsTarget}
                onChange={handleInputChange}
                min="0"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Sleep, hours
              </label>
              <input
                type="number"
                name="dailySleepTarget"
                value={formData.dailySleepTarget}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Training location
              </label>
              <select
                name="trainingLocation"
                value={formData.trainingLocation}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="gym">Gym</option>
                <option value="home">Home</option>
                <option value="outdoor">Outdoor</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Cardio preference
              </label>
              <select
                name="cardioPreference"
                value={formData.cardioPreference}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="incline_walk">Incline walk</option>
                <option value="treadmill_walk">Treadmill walk</option>
                <option value="bike">Bike</option>
                <option value="elliptical">Elliptical</option>
                <option value="running">Running</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Food tracking
              </label>
              <select
                name="foodPreference"
                value={formData.foodPreference}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="regular_scales">Regular scales</option>
                <option value="grams">Grams</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-4">
              <label className="mb-2 block text-sm text-slate-300">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Example: Low-impact plan, focus on consistency, avoid knee pain exercises."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || backendMissing}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Creating..." : "Create Plan"}
          </button>
        </form>
      )}

      {/* Plans list */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">All plans</h2>
            <p className="text-sm text-slate-400">
              Activate a plan to use it in Today, Dashboard, Reports, and
              progress tracking.
            </p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-lg font-semibold text-slate-200">
              No plans found
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Create your first transformation plan to start structured
              tracking.
            </p>

            {!showCreateForm && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
              >
                <Plus size={16} />
                Create First Plan
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {plans.map((plan) => {
              const isActive = plan.isActive || plan.status === "active";

              return (
                <div
                  key={plan._id}
                  className="rounded-3xl border border-white/10 bg-[#061316]/50 p-5"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">
                        {plan.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                      </p>
                    </div>

                    <span
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold capitalize ${getStatusClass(
                        plan.status,
                        isActive
                      )}`}
                    >
                      {isActive ? "Active" : plan.status || "draft"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <PlanMetric
                      label="Goal"
                      value={plan.goalType?.replace("_", " ") || "--"}
                      icon={Target}
                    />

                    <PlanMetric
                      label="Weeks"
                      value={plan.durationWeeks || "--"}
                      icon={CalendarDays}
                    />

                    <PlanMetric
                      label="Workout Days"
                      value={plan.weeklyWorkoutDays || "--"}
                      suffix="/ week"
                      icon={Dumbbell}
                    />

                    <PlanMetric
                      label="Calories"
                      value={plan.targets?.calories || plan.dailyCalorieTarget || "--"}
                      suffix="kcal"
                      icon={Flame}
                    />

                    <PlanMetric
                      label="Protein"
                      value={plan.targets?.protein || plan.dailyProteinTarget || "--"}
                      suffix="g"
                      icon={Utensils}
                    />

                    <PlanMetric
                      label="Water"
                      value={plan.targets?.waterLiters || "--"}
                      suffix="L"
                      icon={Activity}
                    />
                  </div>

                  {plan.notes && (
                    <p className="mt-4 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
                      {plan.notes}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleActivatePlan(plan._id)}
                        disabled={actionLoadingId === plan._id || backendMissing}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle size={16} />
                        {actionLoadingId === plan._id ? "Activating..." : "Activate"}
                      </button>
                    )}

                    <Link
                      to="/today"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                    >
                      Today
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to="/reports"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                    >
                      Reports
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan._id)}
                      disabled={actionLoadingId === plan._id || backendMissing}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
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

export default Plans;