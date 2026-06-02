import { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Flame,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  Utensils,
  Wheat,
  Droplets,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const initialFood = {
  entryType: "library", // library or manual
  food: "",
  name: "",
  quantityValue: 1,
  unit: "g",

  calories: "",
  protein: "",
  carbs: "",
  fats: "",
  fiber: "",
  sugar: "",
  sodium: "",
  notes: "",
};

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const getServingGramAmount = (food, quantityValue, unit) => {
  const selectedUnit = String(unit || "g").toLowerCase();

  if (selectedUnit === "g") return Number(quantityValue || 0);
  if (selectedUnit === "kg") return Number(quantityValue || 0) * 1000;

  const servingUnit = food?.servingUnits?.find(
    (item) => item.unit === selectedUnit,
  );

  if (servingUnit) {
    return Number(quantityValue || 0) * Number(servingUnit.gramEquivalent || 0);
  }

  return Number(quantityValue || 0);
};

const calculateLibraryFood = (item, foodLibrary) => {
  const selectedFood = foodLibrary.find((food) => food._id === item.food);

  if (!selectedFood) {
    return {
      ...item,
      calculatedCalories: 0,
      calculatedProtein: 0,
      calculatedCarbs: 0,
      calculatedFats: 0,
      calculatedFiber: 0,
      gramAmount: 0,
    };
  }

  const gramAmount = getServingGramAmount(
    selectedFood,
    item.quantityValue,
    item.unit,
  );

  const multiplier = gramAmount / 100;

  return {
    ...item,
    name: selectedFood.name,
    calculatedCalories: round(selectedFood.caloriesPer100g * multiplier),
    calculatedProtein: round(selectedFood.proteinPer100g * multiplier),
    calculatedCarbs: round(selectedFood.carbsPer100g * multiplier),
    calculatedFats: round(selectedFood.fatsPer100g * multiplier),
    calculatedFiber: round((selectedFood.fiberPer100g || 0) * multiplier),
    calculatedSugar: round((selectedFood.sugarPer100g || 0) * multiplier),
    calculatedSodium: round((selectedFood.sodiumPer100g || 0) * multiplier),
    gramAmount: round(gramAmount),
  };
};

const calculateManualFood = (item) => {
  return {
    ...item,
    calculatedCalories: round(item.calories),
    calculatedProtein: round(item.protein),
    calculatedCarbs: round(item.carbs),
    calculatedFats: round(item.fats),
    calculatedFiber: round(item.fiber),
    calculatedSugar: round(item.sugar),
    calculatedSodium: round(item.sodium),
    gramAmount: Number(item.gramAmount || 0),
  };
};

const StatCard = ({ title, value, suffix, icon: Icon, helper }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#009587]/10 blur-2xl" />

      <div className="relative flex items-center justify-between gap-4">
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

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);

  const [formData, setFormData] = useState({
    date: getTodayDate(),
    mealType: "breakfast",
    mealTiming: "morning",
    notes: "",
    foods: [{ ...initialFood }],
  });

  const [summary, setSummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
    mealCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMealPageData = async () => {
      try {
        const [mealResponse, foodResponse, summaryResponse] = await Promise.all(
          [
            api.get("/meals?limit=15"),
            api.get("/foods?limit=100"),
            api.get("/meals/summary/daily"),
          ],
        );

        if (!isMounted) return;

        setMeals(mealResponse.data.meals || []);
        setFoods(foodResponse.data.foods || []);
        setSummary(summaryResponse.data.summary || {});
      } catch (error) {
        console.error("Meal page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load meal data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMealPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshMeals = async () => {
    const [mealResponse, summaryResponse] = await Promise.all([
      api.get("/meals?limit=15"),
      api.get("/meals/summary/daily"),
    ]);

    setMeals(mealResponse.data.meals || []);
    setSummary(summaryResponse.data.summary || {});
  };

  const calculatedFoods = useMemo(() => {
    return formData.foods.map((item) => {
      if (item.entryType === "manual") {
        return calculateManualFood(item);
      }

      return calculateLibraryFood(item, foods);
    });
  }, [formData.foods, foods]);

  const formTotals = useMemo(() => {
    return calculatedFoods.reduce(
      (totals, item) => {
        totals.calories += Number(item.calculatedCalories || 0);
        totals.protein += Number(item.calculatedProtein || 0);
        totals.carbs += Number(item.calculatedCarbs || 0);
        totals.fats += Number(item.calculatedFats || 0);
        totals.fiber += Number(item.calculatedFiber || 0);
        return totals;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
      },
    );
  }, [calculatedFoods]);

  const handleMainChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFoodChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedFoods = [...prev.foods];

      updatedFoods[index] = {
        ...updatedFoods[index],
        [field]: value,
      };

      return {
        ...prev,
        foods: updatedFoods,
      };
    });
  };

  const handleFoodSelect = (index, foodId) => {
    const selectedFood = foods.find((food) => food._id === foodId);

    setFormData((prev) => {
      const updatedFoods = [...prev.foods];

      updatedFoods[index] = {
        ...updatedFoods[index],
        entryType: "library",
        food: foodId,
        name: selectedFood?.name || "",
        quantityValue: selectedFood?.defaultServingQuantity || 1,
        unit: selectedFood?.defaultServingUnit || "g",
      };

      return {
        ...prev,
        foods: updatedFoods,
      };
    });
  };

  const addFoodRow = () => {
    setFormData((prev) => ({
      ...prev,
      foods: [...prev.foods, { ...initialFood }],
    }));
  };

  const removeFoodRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      date: getTodayDate(),
      mealType: "breakfast",
      mealTiming: "morning",
      notes: "",
      foods: [{ ...initialFood }],
    });
  };

  const buildMealPayload = () => {
    return {
      date: formData.date,
      mealType: formData.mealType,
      mealTiming: formData.mealTiming,
      notes: formData.notes,
      foods: formData.foods
        .filter((food) => {
          if (food.entryType === "library") return food.food;
          return food.name.trim() !== "";
        })
        .map((food) => {
          if (food.entryType === "library") {
            return {
              food: food.food,
              quantityValue: Number(food.quantityValue || 0),
              unit: food.unit || "g",
              notes: food.notes || "",
            };
          }

          return {
            name: food.name,
            quantity: `${food.quantityValue || ""} ${food.unit || ""}`.trim(),
            quantityValue: Number(food.quantityValue || 0),
            unit: food.unit || "g",
            calories: Number(food.calories || 0),
            protein: Number(food.protein || 0),
            carbs: Number(food.carbs || 0),
            fats: Number(food.fats || 0),
            fiber: Number(food.fiber || 0),
            sugar: Number(food.sugar || 0),
            sodium: Number(food.sodium || 0),
            isManualEntry: true,
            notes: food.notes || "",
          };
        }),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = buildMealPayload();

      if (payload.foods.length === 0) {
        throw new Error("Please add at least one food item.");
      }

      await api.post("/meals", payload);

      await refreshMeals();

      resetForm();
      setMessage("Meal added successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Failed to add meal.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meal?",
    );

    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      await api.delete(`/meals/${id}`);
      await refreshMeals();
      setMessage("Meal deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete meal.");
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading meals"
        message="Preparing your meals, food library, and macro summary."
      />
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#009587]/20 via-white/[0.04] to-[#00809d]/20 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#00c2ad]/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-3 py-1 text-xs font-semibold text-[#9ff7ec]">
              <Sparkles size={14} />
              Smart Meal Tracker
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Meal & macro records
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Select foods from your library and record portions using regular
              scales like cup, roti, bowl, egg, spoon, plate, scoop, or grams.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#07191d]/60 p-4 backdrop-blur-xl">
            <p className="text-xs text-slate-400">Today</p>
            <p className="mt-1 text-lg font-semibold">
              {new Date().toLocaleDateString()}
            </p>
          </div>
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Calories Today"
          value={summary?.totalCalories || 0}
          suffix="kcal"
          icon={Flame}
          helper={`${summary?.mealCount || 0} meals logged`}
        />

        <StatCard
          title="Protein Today"
          value={summary?.totalProtein || 0}
          suffix="g"
          icon={Target}
          helper="Calculated from meals"
        />

        <StatCard
          title="Carbs Today"
          value={summary?.totalCarbs || 0}
          suffix="g"
          icon={Wheat}
          helper="Energy source"
        />

        <StatCard
          title="Fats Today"
          value={summary?.totalFats || 0}
          suffix="g"
          icon={Droplets}
          helper="Dietary fats"
        />

        <StatCard
          title="Fiber Today"
          value={summary?.totalFiber || 0}
          suffix="g"
          icon={Utensils}
          helper="Digestive support"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Add meal</h2>
              <p className="text-sm text-slate-400">
                The backend will calculate and save final macros.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleMainChange}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />

              <select
                name="mealType"
                value={formData.mealType}
                onChange={handleMainChange}
                className="rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
                <option value="pre_workout">Pre-workout</option>
                <option value="post_workout">Post-workout</option>
                <option value="job_snack">Job snack</option>
                <option value="before_sleep">Before sleep</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Meal timing
              </label>
              <select
                name="mealTiming"
                value={formData.mealTiming}
                onChange={handleMainChange}
                className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              >
                <option value="morning">Morning</option>
                <option value="midday">Midday</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="late_night">Late night</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Notes</label>
              <input
                name="notes"
                value={formData.notes}
                onChange={handleMainChange}
                placeholder="Example: high protein lunch"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
              />
            </div>
          </div>

          {/* Food Items */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Food items</h3>
              <p className="text-sm text-slate-400">
                Choose food library or manual entry.
              </p>
            </div>

            <button
              type="button"
              onClick={addFoodRow}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#009587]/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={16} />
              Add Food
            </button>
          </div>

          <div className="space-y-4">
            {formData.foods.map((food, index) => {
              const selectedFood = foods.find((item) => item._id === food.food);
              const calculated = calculatedFoods[index];

              const availableUnits =
                selectedFood?.servingUnits?.length > 0
                  ? selectedFood.servingUnits
                  : [
                      { unit: "g", label: "Gram" },
                      { unit: "kg", label: "Kilogram" },
                    ];

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-semibold text-slate-200">
                      Food {index + 1}
                    </p>

                    {formData.foods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodRow(index)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>

                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleFoodChange(index, "entryType", "library")
                      }
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        food.entryType === "library"
                          ? "border-[#009587]/50 bg-[#009587]/15 text-[#9ff7ec]"
                          : "border-white/10 bg-white/[0.04] text-slate-400"
                      }`}
                    >
                      Food Library
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleFoodChange(index, "entryType", "manual")
                      }
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        food.entryType === "manual"
                          ? "border-[#009587]/50 bg-[#009587]/15 text-[#9ff7ec]"
                          : "border-white/10 bg-white/[0.04] text-slate-400"
                      }`}
                    >
                      Manual Entry
                    </button>
                  </div>

                  {food.entryType === "library" ? (
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs text-slate-400">
                          Select Food
                        </label>

                        <select
                          value={food.food}
                          onChange={(e) =>
                            handleFoodSelect(index, e.target.value)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        >
                          <option value="">Choose food</option>
                          {foods.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name}
                              {item.localName ? ` (${item.localName})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Quantity
                        </label>

                        <input
                          type="number"
                          value={food.quantityValue}
                          onChange={(e) =>
                            handleFoodChange(
                              index,
                              "quantityValue",
                              e.target.value,
                            )
                          }
                          min="0"
                          step="0.1"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Unit
                        </label>

                        <select
                          value={food.unit}
                          onChange={(e) =>
                            handleFoodChange(index, "unit", e.target.value)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-[#0b2025] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>

                          {availableUnits.map((unitItem) => (
                            <option
                              key={`${selectedFood?._id || "unit"}-${
                                unitItem.unit
                              }`}
                              value={unitItem.unit}
                            >
                              {unitItem.label || unitItem.unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs text-slate-400">
                          Food Name
                        </label>

                        <input
                          value={food.name}
                          onChange={(e) =>
                            handleFoodChange(index, "name", e.target.value)
                          }
                          placeholder="Homemade chicken curry"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Quantity
                        </label>

                        <input
                          type="number"
                          value={food.quantityValue}
                          onChange={(e) =>
                            handleFoodChange(
                              index,
                              "quantityValue",
                              e.target.value,
                            )
                          }
                          min="0"
                          step="0.1"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Unit
                        </label>

                        <input
                          value={food.unit}
                          onChange={(e) =>
                            handleFoodChange(index, "unit", e.target.value)
                          }
                          placeholder="bowl"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Calories
                        </label>
                        <input
                          type="number"
                          value={food.calories}
                          onChange={(e) =>
                            handleFoodChange(index, "calories", e.target.value)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Protein
                        </label>
                        <input
                          type="number"
                          value={food.protein}
                          onChange={(e) =>
                            handleFoodChange(index, "protein", e.target.value)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Carbs
                        </label>
                        <input
                          type="number"
                          value={food.carbs}
                          onChange={(e) =>
                            handleFoodChange(index, "carbs", e.target.value)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Fats
                        </label>
                        <input
                          type="number"
                          value={food.fats}
                          onChange={(e) =>
                            handleFoodChange(index, "fats", e.target.value)
                          }
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-5">
                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-xs text-slate-400">Calories</p>
                      <p className="mt-1 font-bold">
                        {calculated?.calculatedCalories || 0} kcal
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-xs text-slate-400">Protein</p>
                      <p className="mt-1 font-bold">
                        {calculated?.calculatedProtein || 0}g
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-xs text-slate-400">Carbs</p>
                      <p className="mt-1 font-bold">
                        {calculated?.calculatedCarbs || 0}g
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-xs text-slate-400">Fats</p>
                      <p className="mt-1 font-bold">
                        {calculated?.calculatedFats || 0}g
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <p className="text-xs text-slate-400">Gram amount</p>
                      <p className="mt-1 font-bold">
                        {calculated?.gramAmount || 0}g
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form totals */}
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Meal Calories</p>
              <h3 className="mt-1 text-xl font-bold">
                {round(formTotals.calories)}
              </h3>
            </div>

            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Protein</p>
              <h3 className="mt-1 text-xl font-bold">
                {round(formTotals.protein)}g
              </h3>
            </div>

            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Carbs</p>
              <h3 className="mt-1 text-xl font-bold">
                {round(formTotals.carbs)}g
              </h3>
            </div>

            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Fats</p>
              <h3 className="mt-1 text-xl font-bold">
                {round(formTotals.fats)}g
              </h3>
            </div>

            <div className="rounded-2xl bg-[#061316]/70 p-4">
              <p className="text-xs text-slate-400">Fiber</p>
              <h3 className="mt-1 text-xl font-bold">
                {round(formTotals.fiber)}g
              </h3>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Meal"}
          </button>
        </form>

        {/* Side Summary */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Meal summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Meals Logged Today</p>
                <h3 className="mt-1 text-3xl font-bold">
                  {summary?.mealCount || 0}
                </h3>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Foods in Library</p>
                <h3 className="mt-1 text-3xl font-bold">{foods.length}</h3>
              </div>

              <div className="rounded-2xl bg-[#009587]/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Calculator size={18} className="text-[#9ff7ec]" />
                  <p className="text-sm font-semibold text-[#9ff7ec]">
                    Regular scale support
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Use cup, bowl, plate, roti, egg, scoop, spoon, piece, or
                  grams. Final calculation is handled by the backend.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Latest meal
            </h2>

            <div className="mt-4 rounded-2xl bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Meal type</p>
              <h3 className="mt-1 text-lg font-semibold capitalize">
                {meals[0]?.mealType?.replace("_", " ") || "No meal yet"}
              </h3>

              {meals[0] && (
                <p className="mt-2 text-sm text-slate-400">
                  {meals[0].totalCalories || 0} kcal •{" "}
                  {meals[0].totalProtein || 0}g protein
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Meal History */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <h2 className="text-xl font-semibold tracking-tight">Meal history</h2>

        {meals.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
            No meals logged yet.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {meals.map((meal) => (
              <div
                key={meal._id}
                className="rounded-3xl border border-white/10 bg-[#061316]/50 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Utensils size={18} className="text-[#00c2ad]" />
                      <h3 className="text-lg font-semibold capitalize">
                        {meal.mealType?.replace("_", " ")}
                      </h3>
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(meal.date).toLocaleDateString()} •{" "}
                      {meal.totalCalories || 0} kcal • {meal.totalProtein || 0}g
                      protein • {meal.totalCarbs || 0}g carbs •{" "}
                      {meal.totalFats || 0}g fats
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {meal.foods?.map((food, index) => (
                        <span
                          key={index}
                          className="rounded-xl bg-white/[0.05] px-3 py-1 text-sm text-slate-300"
                        >
                          {food.name} (
                          {food.quantity || food.servingLabel || "serving"}) —{" "}
                          {food.calories} kcal
                        </span>
                      ))}
                    </div>

                    {meal.notes && (
                      <p className="mt-3 text-sm text-slate-400">
                        {meal.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMeal(meal._id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-2 text-red-300 transition hover:bg-red-500/20"
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

export default Meals;
