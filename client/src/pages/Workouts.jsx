import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Clock,
  Dumbbell,
  Flame,
  Footprints,
  Gauge,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  Weight,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const initialExercise = {
  exercise: "",
  name: "",
  category: "strength",
  muscleGroup: "other",
  equipment: "none",

  sets: 3,
  reps: 10,
  weight: 0,
  restTime: 60,

  duration: "",
  distance: "",
  distanceUnit: "km",
  intensity: "moderate",
  caloriesBurned: "",
  notes: "",
};

const defaultFormData = {
  date: getTodayDate(),
  workoutName: "",
  workoutType: "strength",
  duration: "",
  cardioDuration: "",
  caloriesBurned: "",
  perceivedEffort: "",
  status: "completed",
  painReported: false,
  nextWorkoutSuggestion: "",
  notes: "",
  exercises: [{ ...initialExercise }],
};

const cardioCategories = ["cardio", "mobility"];

const isCardioExercise = (exercise) => {
  return cardioCategories.includes(exercise.category);
};

const round = (value, decimals = 1) => {
  const number = Number(value || 0);
  return Number(number.toFixed(decimals));
};

const formatDate = (dateInput) => {
  if (!dateInput) return "--";

  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const estimateExerciseCalories = (exercise) => {
  if (!isCardioExercise(exercise)) {
    const sets = Number(exercise.sets || 0);
    const reps = Number(exercise.reps || 0);
    const weight = Number(exercise.weight || 0);

    if (sets && reps) {
      return Math.round(sets * reps * Math.max(weight, 5) * 0.01);
    }

    return 0;
  }

  if (exercise.caloriesBurned !== "") {
    return Number(exercise.caloriesBurned || 0);
  }

  const duration = Number(exercise.duration || 0);

  const caloriesPerMinute = {
    low: 4,
    moderate: 7,
    high: 10,
    max: 12,
  };

  return Math.round(duration * (caloriesPerMinute[exercise.intensity] || 7));
};

const getExerciseVolume = (exercise) => {
  if (isCardioExercise(exercise)) return 0;

  return round(
    Number(exercise.sets || 0) *
      Number(exercise.reps || 0) *
      Number(exercise.weight || 0),
    1,
  );
};

const getTypeClass = (type) => {
  if (type === "strength") {
    return "border-[#009587]/30 bg-[#009587]/15 text-[#9ff7ec]";
  }

  if (type === "cardio") {
    return "border-[#00809d]/30 bg-[#00809d]/15 text-[#9ff7ec]";
  }

  if (type === "mixed") {
    return "border-[#00c2ad]/30 bg-[#00c2ad]/15 text-[#9ff7ec]";
  }

  if (type === "bodyweight") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
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

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);

  const [formData, setFormData] = useState(defaultFormData);

  const [filterType, setFilterType] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getWorkoutPageData = async () => {
    const [workoutResponse, exerciseResponse] = await Promise.all([
      api.get("/workouts?limit=30"),
      api.get("/exercises?limit=200"),
    ]);

    return {
      workoutData: workoutResponse.data.workouts || [],
      exerciseData: exerciseResponse.data.exercises || [],
    };
  };

  const applyWorkoutPageData = ({ workoutData, exerciseData }) => {
    setWorkouts(workoutData);
    setExerciseLibrary(exerciseData);
  };

  const refreshWorkoutData = async () => {
    const data = await getWorkoutPageData();
    applyWorkoutPageData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadWorkouts = async () => {
      try {
        const data = await getWorkoutPageData();

        if (!isMounted) return;

        applyWorkoutPageData(data);
      } catch (error) {
        console.error(
          "Workout page fetch error:",
          error.response?.data || error,
        );

        if (isMounted) {
          setError(
            error.response?.data?.message || "Failed to load workout data.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWorkouts();

    return () => {
      isMounted = false;
    };
  }, []);

  const formStats = useMemo(() => {
    const totalDuration =
      Number(formData.duration || 0) ||
      formData.exercises.reduce(
        (total, exercise) => total + Number(exercise.duration || 0),
        0,
      );

    const cardioDuration = formData.exercises
      .filter(isCardioExercise)
      .reduce((total, exercise) => total + Number(exercise.duration || 0), 0);

    const totalVolume = formData.exercises.reduce(
      (total, exercise) => total + getExerciseVolume(exercise),
      0,
    );

    const estimatedCalories =
      formData.caloriesBurned !== ""
        ? Number(formData.caloriesBurned || 0)
        : formData.exercises.reduce(
            (total, exercise) => total + estimateExerciseCalories(exercise),
            0,
          );

    return {
      totalDuration,
      cardioDuration,
      totalVolume: round(totalVolume, 1),
      estimatedCalories,
      exerciseCount: formData.exercises.filter(
        (item) => item.name.trim() !== "",
      ).length,
    };
  }, [formData]);

  const workoutSummary = useMemo(() => {
    const totalDuration = workouts.reduce(
      (total, workout) => total + Number(workout.duration || 0),
      0,
    );

    const totalCalories = workouts.reduce(
      (total, workout) => total + Number(workout.caloriesBurned || 0),
      0,
    );

    const totalVolume = workouts.reduce(
      (total, workout) => total + Number(workout.totalVolume || 0),
      0,
    );

    const cardioCount = workouts.filter(
      (workout) => workout.workoutType === "cardio",
    ).length;

    return {
      total: workouts.length,
      duration: totalDuration,
      calories: totalCalories,
      volume: round(totalVolume, 1),
      cardioCount,
    };
  }, [workouts]);

  const filteredWorkouts = useMemo(() => {
    if (filterType === "all") return workouts;

    return workouts.filter((workout) => workout.workoutType === filterType);
  }, [workouts, filterType]);

  const handleMainChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedExercises = [...prev.exercises];

      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: value,
      };

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const handleExerciseSelect = (index, exerciseId) => {
    const selectedExercise = exerciseLibrary.find(
      (exercise) => exercise._id === exerciseId,
    );

    setFormData((prev) => {
      const updatedExercises = [...prev.exercises];

      updatedExercises[index] = {
        ...updatedExercises[index],
        exercise: exerciseId,
        name: selectedExercise?.name || "",
        category: selectedExercise?.category || "strength",
        muscleGroup: selectedExercise?.muscleGroup || "other",
        equipment: selectedExercise?.equipment || "none",
        sets:
          selectedExercise?.defaultSets ?? updatedExercises[index].sets ?? 3,
        reps:
          selectedExercise?.defaultReps ?? updatedExercises[index].reps ?? 10,
        restTime:
          selectedExercise?.defaultRestTime ??
          updatedExercises[index].restTime ??
          60,
      };

      return {
        ...prev,
        exercises: updatedExercises,
        workoutType:
          selectedExercise?.category === "cardio"
            ? "cardio"
            : prev.workoutType === "cardio"
              ? "mixed"
              : prev.workoutType,
      };
    });
  };

  const addExerciseRow = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { ...initialExercise }],
    }));
  };

  const removeExerciseRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const buildWorkoutPayload = () => {
    const exercises = formData.exercises
      .filter((exercise) => exercise.name.trim() !== "")
      .map((exercise) => {
        const base = {
          exercise: exercise.exercise || undefined,
          name: exercise.name.trim(),
          category: exercise.category,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment,
          notes: exercise.notes || "",
        };

        if (isCardioExercise(exercise)) {
          return {
            ...base,
            duration: Number(exercise.duration || 0),
            distance: Number(exercise.distance || 0),
            distanceUnit: exercise.distanceUnit || "km",
            intensity: exercise.intensity || "moderate",
            caloriesBurned: estimateExerciseCalories(exercise),
            sets: 0,
            reps: 0,
            weight: 0,
            restTime: 0,
          };
        }

        return {
          ...base,
          sets: Number(exercise.sets || 0),
          reps: Number(exercise.reps || 0),
          weight: Number(exercise.weight || 0),
          restTime: Number(exercise.restTime || 0),
          duration: Number(exercise.duration || 0),
          caloriesBurned: estimateExerciseCalories(exercise),
        };
      });

    return {
      date: formData.date,
      workoutName: formData.workoutName.trim(),
      workoutType: formData.workoutType,
      duration: Number(formData.duration || formStats.totalDuration || 0),
      cardioDuration: Number(
        formData.cardioDuration || formStats.cardioDuration || 0,
      ),
      caloriesBurned: Number(
        formData.caloriesBurned || formStats.estimatedCalories || 0,
      ),
      perceivedEffort:
        formData.perceivedEffort === ""
          ? undefined
          : Number(formData.perceivedEffort),
      status: formData.status,
      painReported: Boolean(formData.painReported),
      nextWorkoutSuggestion: formData.nextWorkoutSuggestion,
      notes: formData.notes,
      exercises,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = buildWorkoutPayload();

      if (!payload.workoutName) {
        throw new Error("Workout name is required.");
      }

      if (payload.exercises.length === 0) {
        throw new Error("Please add at least one exercise.");
      }

      const invalidCardio = payload.exercises.find(
        (exercise) =>
          cardioCategories.includes(exercise.category) && !exercise.duration,
      );

      if (invalidCardio) {
        throw new Error(`Please add duration for ${invalidCardio.name}.`);
      }

      const invalidStrength = payload.exercises.find(
        (exercise) =>
          !cardioCategories.includes(exercise.category) &&
          !exercise.sets &&
          !exercise.reps,
      );

      if (invalidStrength) {
        throw new Error(`Please add sets or reps for ${invalidStrength.name}.`);
      }

      await api.post("/workouts", payload);

      await refreshWorkoutData();

      resetForm();
      setMessage("Workout added successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create workout.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this workout?",
    );

    if (!confirmDelete) return;

    setDeletingId(id);
    setMessage("");
    setError("");

    try {
      await api.delete(`/workouts/${id}`);
      await refreshWorkoutData();
      setMessage("Workout deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete workout.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading workouts"
        message="Preparing workout history, exercise library, and dynamic exercise tracking."
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
              Dynamic Workout Tracker
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Record strength, cardio, and mixed sessions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Strength exercises use sets, reps, weight, and rest time. Cardio
              exercises use duration, distance, intensity, and calorie burn.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshWorkoutData}
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Workouts"
          value={workoutSummary.total}
          helper="All logged sessions"
          icon={Dumbbell}
        />

        <StatCard
          title="Total Duration"
          value={workoutSummary.duration}
          suffix="min"
          helper="Training time"
          icon={Clock}
        />

        <StatCard
          title="Calories Burned"
          value={workoutSummary.calories}
          suffix="kcal"
          helper="Estimated burn"
          icon={Flame}
        />

        <StatCard
          title="Workout Volume"
          value={workoutSummary.volume}
          suffix="kg"
          helper="Strength volume"
          icon={Weight}
        />

        <StatCard
          title="Cardio Sessions"
          value={workoutSummary.cardioCount}
          helper="Cardio-only sessions"
          icon={Footprints}
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
                Add workout
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Exercise input changes automatically based on category.
              </p>
            </div>

            <span
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold capitalize ${getTypeClass(
                formData.workoutType,
              )}`}
            >
              {formData.workoutType}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Workout name
              </label>
              <input
                name="workoutName"
                value={formData.workoutName}
                onChange={handleMainChange}
                placeholder="Push Day / Morning Cardio"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleMainChange}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Workout type
              </label>
              <select
                name="workoutType"
                value={formData.workoutType}
                onChange={handleMainChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="mixed">Mixed</option>
                <option value="bodyweight">Bodyweight</option>
                <option value="mobility">Mobility</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Total duration, min
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleMainChange}
                placeholder={String(formStats.totalDuration || 60)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Cardio duration, min
              </label>
              <input
                type="number"
                name="cardioDuration"
                value={formData.cardioDuration}
                onChange={handleMainChange}
                placeholder={String(formStats.cardioDuration || 0)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Calories burned
              </label>
              <input
                type="number"
                name="caloriesBurned"
                value={formData.caloriesBurned}
                onChange={handleMainChange}
                placeholder={String(formStats.estimatedCalories || 0)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Effort, 1-10
              </label>
              <input
                type="number"
                name="perceivedEffort"
                value={formData.perceivedEffort}
                onChange={handleMainChange}
                min="1"
                max="10"
                placeholder="7"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleMainChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="completed">Completed</option>
                <option value="partially_completed">Partially completed</option>
                <option value="skipped">Skipped</option>
                <option value="planned">Planned</option>
              </select>
            </div>
          </div>

          {/* Live form summary */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Exercises</p>
              <p className="mt-1 text-xl font-bold">
                {formStats.exerciseCount}
              </p>
            </div>

            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Volume</p>
              <p className="mt-1 text-xl font-bold">
                {formStats.totalVolume} kg
              </p>
            </div>

            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Cardio Time</p>
              <p className="mt-1 text-xl font-bold">
                {formStats.cardioDuration} min
              </p>
            </div>

            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Estimated Burn</p>
              <p className="mt-1 text-xl font-bold">
                {formStats.estimatedCalories} kcal
              </p>
            </div>
          </div>

          {/* Exercises */}
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Exercises</h3>
                <p className="text-sm text-slate-400">
                  Select from library or type custom exercise.
                </p>
              </div>

              <button
                type="button"
                onClick={addExerciseRow}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {formData.exercises.map((exercise, index) => {
                const cardio = isCardioExercise(exercise);

                return (
                  <div
                    key={index}
                    className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#009587]/15 text-[#9ff7ec]">
                          {cardio ? <Bike size={19} /> : <Dumbbell size={19} />}
                        </div>

                        <div>
                          <p className="font-semibold">Exercise {index + 1}</p>
                          <p className="text-xs text-slate-400">
                            {cardio
                              ? "Cardio mode: duration, distance, intensity"
                              : "Strength mode: sets, reps, weight, rest"}
                          </p>
                        </div>
                      </div>

                      {formData.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExerciseRow(index)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="xl:col-span-2">
                        <label className="mb-2 block text-xs text-slate-400">
                          Exercise library
                        </label>

                        <select
                          value={exercise.exercise}
                          onChange={(e) =>
                            handleExerciseSelect(index, e.target.value)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        >
                          <option value="">Choose from library</option>
                          {exerciseLibrary.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name} • {item.category} • {item.muscleGroup}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Custom name
                        </label>
                        <input
                          value={exercise.name}
                          onChange={(e) =>
                            handleExerciseChange(index, "name", e.target.value)
                          }
                          placeholder="Bench Press / Treadmill"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Category
                        </label>
                        <select
                          value={exercise.category}
                          onChange={(e) =>
                            handleExerciseChange(
                              index,
                              "category",
                              e.target.value,
                            )
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        >
                          <option value="strength">Strength</option>
                          <option value="cardio">Cardio</option>
                          <option value="bodyweight">Bodyweight</option>
                          <option value="mobility">Mobility</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {cardio ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Duration, min
                          </label>
                          <input
                            type="number"
                            value={exercise.duration}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "duration",
                                e.target.value,
                              )
                            }
                            placeholder="20"
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Distance
                          </label>
                          <input
                            type="number"
                            value={exercise.distance}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "distance",
                                e.target.value,
                              )
                            }
                            placeholder="2.5"
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Unit
                          </label>
                          <select
                            value={exercise.distanceUnit}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "distanceUnit",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          >
                            <option value="km">km</option>
                            <option value="mile">mile</option>
                            <option value="meter">meter</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Intensity
                          </label>
                          <select
                            value={exercise.intensity}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "intensity",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          >
                            <option value="low">Low</option>
                            <option value="moderate">Moderate</option>
                            <option value="high">High</option>
                            <option value="max">Max</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Calories
                          </label>
                          <input
                            type="number"
                            value={exercise.caloriesBurned}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "caloriesBurned",
                                e.target.value,
                              )
                            }
                            placeholder={String(
                              estimateExerciseCalories(exercise),
                            )}
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Sets
                          </label>
                          <input
                            type="number"
                            value={exercise.sets}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "sets",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Reps
                          </label>
                          <input
                            type="number"
                            value={exercise.reps}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "reps",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Weight, kg
                          </label>
                          <input
                            type="number"
                            value={exercise.weight}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "weight",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Rest, sec
                          </label>
                          <input
                            type="number"
                            value={exercise.restTime}
                            onChange={(e) =>
                              handleExerciseChange(
                                index,
                                "restTime",
                                e.target.value,
                              )
                            }
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs text-slate-400">
                            Volume
                          </label>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-[#9ff7ec]">
                            {getExerciseVolume(exercise)} kg
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="mb-2 block text-xs text-slate-400">
                        Exercise notes
                      </label>
                      <input
                        value={exercise.notes}
                        onChange={(e) =>
                          handleExerciseChange(index, "notes", e.target.value)
                        }
                        placeholder="Example: felt strong, increase next time"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workout notes */}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Next workout suggestion
              </label>
              <input
                name="nextWorkoutSuggestion"
                value={formData.nextWorkoutSuggestion}
                onChange={handleMainChange}
                placeholder="Add 2.5kg to bench press next time"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <input
                type="checkbox"
                name="painReported"
                checked={formData.painReported}
                onChange={handleMainChange}
                className="h-5 w-5 accent-[#009587]"
              />
              <span className="text-sm text-slate-300">
                Pain or discomfort reported
              </span>
            </label>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-slate-300">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleMainChange}
              rows="3"
              placeholder="How was your workout?"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </form>

        {/* Side Summary */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Workout summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Latest workout</p>
                <h3 className="mt-1 text-lg font-semibold">
                  {workouts[0]?.workoutName || "No workout yet"}
                </h3>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Exercise library</p>
                <h3 className="mt-1 text-3xl font-bold">
                  {exerciseLibrary.length}
                </h3>
              </div>

              <div className="rounded-2xl border border-[#009587]/20 bg-[#009587]/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Gauge size={18} className="text-[#9ff7ec]" />
                  <p className="text-sm font-semibold text-[#9ff7ec]">
                    Dynamic mode
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Cardio uses time/distance. Strength uses sets/reps/weight. The
                  form switches automatically by exercise category.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Quick filters
            </h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "all",
                "strength",
                "cardio",
                "mixed",
                "bodyweight",
                "other",
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold capitalize transition ${
                    filterType === type
                      ? "bg-gradient-to-r from-[#009587] to-[#00809d] text-white shadow-lg shadow-[#009587]/20"
                      : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workout History */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold tracking-tight">
          Workout history
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Recent logged workouts with dynamic exercise details.
        </p>

        {filteredWorkouts.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No workouts found.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout._id}
                className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Dumbbell size={18} className="text-[#00c2ad]" />

                      <h3 className="text-lg font-semibold">
                        {workout.workoutName}
                      </h3>

                      <span
                        className={`rounded-xl border px-3 py-1 text-xs font-semibold capitalize ${getTypeClass(
                          workout.workoutType,
                        )}`}
                      >
                        {workout.workoutType}
                      </span>

                      {workout.status && (
                        <span className="rounded-xl bg-white/[0.05] px-3 py-1 text-xs text-slate-300 capitalize">
                          {workout.status.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400">
                      {formatDate(workout.date)} • {workout.duration || 0} min •{" "}
                      {workout.caloriesBurned || 0} kcal • Volume{" "}
                      {workout.totalVolume || 0} kg
                    </p>

                    {workout.painReported && (
                      <p className="mt-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        Pain reported. Review progression carefully.
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {workout.exercises?.map((exercise, index) => {
                        const cardio =
                          exercise.category === "cardio" ||
                          exercise.duration ||
                          exercise.distance;

                        return (
                          <span
                            key={`${workout._id}-${index}`}
                            className="rounded-xl bg-white/[0.05] px-3 py-1 text-sm text-slate-300"
                          >
                            {exercise.name}:{" "}
                            {cardio
                              ? `${exercise.duration || 0} min${
                                  exercise.distance
                                    ? ` • ${exercise.distance} ${
                                        exercise.distanceUnit || "km"
                                      }`
                                    : ""
                                }`
                              : `${exercise.sets || 0}×${exercise.reps || 0}${
                                  exercise.weight
                                    ? ` @ ${exercise.weight}kg`
                                    : ""
                                }`}
                          </span>
                        );
                      })}
                    </div>

                    {workout.nextWorkoutSuggestion && (
                      <p className="mt-3 text-sm text-[#9ff7ec]">
                        Next: {workout.nextWorkoutSuggestion}
                      </p>
                    )}

                    {workout.notes && (
                      <p className="mt-3 text-sm text-slate-400">
                        {workout.notes}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWorkout(workout._id)}
                    disabled={deletingId === workout._id}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    {deletingId === workout._id ? "Deleting..." : "Delete"}
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

export default Workouts;
