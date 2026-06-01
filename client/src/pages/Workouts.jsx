import { useEffect, useState } from "react";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import api from "../services/api";

const initialExercise = {
  name: "",
  sets: 3,
  reps: 10,
  weight: 0,
  restTime: 60,
};

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [formData, setFormData] = useState({
    workoutName: "",
    workoutType: "strength",
    duration: "",
    cardioDuration: "",
    notes: "",
    exercises: [initialExercise],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.get("/workouts"), api.get("/exercises")])
      .then(([workoutResponse, exerciseResponse]) => {
        if (isMounted) {
          setWorkouts(workoutResponse.data.workouts || []);
          setExercises(exerciseResponse.data.exercises || []);
        }
      })
      .catch((error) => {
        console.error("Workout page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load workout data.");
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

  const fetchWorkouts = async () => {
    const response = await api.get("/workouts");
    setWorkouts(response.data.workouts || []);
  };

  const handleMainChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
    setFormData({
      workoutName: "",
      workoutType: "strength",
      duration: "",
      cardioDuration: "",
      notes: "",
      exercises: [initialExercise],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        workoutName: formData.workoutName,
        workoutType: formData.workoutType,
        duration: formData.duration ? Number(formData.duration) : 0,
        cardioDuration: formData.cardioDuration
          ? Number(formData.cardioDuration)
          : 0,
        notes: formData.notes,
        exercises: formData.exercises
          .filter((exercise) => exercise.name.trim() !== "")
          .map((exercise) => ({
            name: exercise.name,
            sets: Number(exercise.sets) || 0,
            reps: Number(exercise.reps) || 0,
            weight: Number(exercise.weight) || 0,
            restTime: Number(exercise.restTime) || 0,
          })),
      };

      if (!payload.workoutName) {
        throw new Error("Workout name is required.");
      }

      if (payload.exercises.length === 0) {
        throw new Error("Please add at least one exercise.");
      }

      await api.post("/workouts", payload);

      await fetchWorkouts();

      resetForm();
      setMessage("Workout added successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create workout."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this workout?"
    );

    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      await api.delete(`/workouts/${id}`);
      await fetchWorkouts();
      setMessage("Workout deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete workout.");
    }
  };

  if (loading) {
    return <div className="text-slate-300">Loading workouts...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Workout Tracker</h1>
        <p className="text-slate-400">
          Log your exercises, sets, reps, weights, and workout history.
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

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-xl font-semibold mb-5">Add Workout</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Workout Name
              </label>
              <input
                name="workoutName"
                value={formData.workoutName}
                onChange={handleMainChange}
                placeholder="Push Day"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Workout Type
              </label>
              <select
                name="workoutType"
                value={formData.workoutType}
                onChange={handleMainChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="mixed">Mixed</option>
                <option value="bodyweight">Bodyweight</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Duration
              </label>
              <input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleMainChange}
                placeholder="60"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
              <p className="text-xs text-slate-500 mt-1">Minutes</p>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Cardio Duration
              </label>
              <input
                name="cardioDuration"
                type="number"
                value={formData.cardioDuration}
                onChange={handleMainChange}
                placeholder="10"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
              <p className="text-xs text-slate-500 mt-1">Minutes</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Exercises</h3>

              <button
                type="button"
                onClick={addExerciseRow}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {formData.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-300">
                      Exercise {index + 1}
                    </p>

                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExerciseRow(index)}
                        className="text-red-300 hover:text-red-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">
                        Exercise Name
                      </label>

                      <input
                        list="exercise-list"
                        value={exercise.name}
                        onChange={(e) =>
                          handleExerciseChange(index, "name", e.target.value)
                        }
                        placeholder="Bench Press"
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />

                      <datalist id="exercise-list">
                        {exercises.map((item) => (
                          <option key={item._id} value={item.name} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Sets
                      </label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleExerciseChange(index, "sets", e.target.value)
                        }
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleExerciseChange(index, "reps", e.target.value)
                        }
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Weight
                      </label>
                      <input
                        type="number"
                        value={exercise.weight}
                        onChange={(e) =>
                          handleExerciseChange(index, "weight", e.target.value)
                        }
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs text-slate-400 mb-1">
                      Rest Time
                    </label>
                    <input
                      type="number"
                      value={exercise.restTime}
                      onChange={(e) =>
                        handleExerciseChange(index, "restTime", e.target.value)
                      }
                      className="w-full md:w-40 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Seconds</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm text-slate-300 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleMainChange}
              rows="3"
              placeholder="How was your workout?"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Workout Summary</h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Total Workouts</p>
              <h3 className="text-3xl font-bold">{workouts.length}</h3>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Latest Workout</p>
              <h3 className="text-lg font-semibold mt-1">
                {workouts[0]?.workoutName || "No workout yet"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-5">Workout History</h2>

        {workouts.length === 0 ? (
          <div className="text-slate-400">No workouts logged yet.</div>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div
                key={workout._id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Dumbbell size={18} className="text-orange-400" />
                      <h3 className="font-semibold text-lg">
                        {workout.workoutName}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(workout.date).toLocaleDateString()} •{" "}
                      {workout.workoutType} • {workout.duration || 0} min •{" "}
                      {workout.caloriesBurned || 0} kcal
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {workout.exercises?.map((exercise, index) => (
                        <span
                          key={index}
                          className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300"
                        >
                          {exercise.name}: {exercise.sets}×{exercise.reps}
                          {exercise.weight ? ` @ ${exercise.weight}kg` : ""}
                        </span>
                      ))}
                    </div>

                    {workout.notes && (
                      <p className="text-sm text-slate-400 mt-3">
                        {workout.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteWorkout(workout._id)}
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

export default Workouts;