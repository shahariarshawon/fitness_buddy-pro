import { useEffect, useState } from "react";
import { Plus, Trash2, Utensils } from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const initialFood = {
  name: "",
  quantity: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
};

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);

  const [formData, setFormData] = useState({
    mealType: "breakfast",
    notes: "",
    foods: [{ ...initialFood }],
  });

  const [summary, setSummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("/meals"),
      api.get("/foods"),
      api.get("/meals/summary/daily"),
    ])
      .then(([mealResponse, foodResponse, summaryResponse]) => {
        if (isMounted) {
          setMeals(mealResponse.data.meals || []);
          setFoods(foodResponse.data.foods || []);
          setSummary(summaryResponse.data.summary || {});
        }
      })
      .catch((error) => {
        console.error("Meal page fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load meal data.");
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

  const fetchMeals = async () => {
    const [mealResponse, summaryResponse] = await Promise.all([
      api.get("/meals"),
      api.get("/meals/summary/daily"),
    ]);

    setMeals(mealResponse.data.meals || []);
    setSummary(summaryResponse.data.summary || {});
  };

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

  const handleFoodNameChange = (index, value) => {
    const selectedFood = foods.find(
      (food) => food.name.toLowerCase() === value.toLowerCase()
    );

    setFormData((prev) => {
      const updatedFoods = [...prev.foods];

      updatedFoods[index] = {
        ...updatedFoods[index],
        name: value,
        quantity: selectedFood?.servingSize || updatedFoods[index].quantity,
        calories: selectedFood?.calories ?? updatedFoods[index].calories,
        protein: selectedFood?.protein ?? updatedFoods[index].protein,
        carbs: selectedFood?.carbs ?? updatedFoods[index].carbs,
        fats: selectedFood?.fats ?? updatedFoods[index].fats,
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
      mealType: "breakfast",
      notes: "",
      foods: [{ ...initialFood }],
    });
  };

  const calculateFormTotals = () => {
    return formData.foods.reduce(
      (totals, food) => {
        totals.calories += Number(food.calories || 0);
        totals.protein += Number(food.protein || 0);
        totals.carbs += Number(food.carbs || 0);
        totals.fats += Number(food.fats || 0);
        return totals;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        mealType: formData.mealType,
        notes: formData.notes,
        foods: formData.foods
          .filter((food) => food.name.trim() !== "")
          .map((food) => ({
            name: food.name,
            quantity: food.quantity,
            calories: Number(food.calories) || 0,
            protein: Number(food.protein) || 0,
            carbs: Number(food.carbs) || 0,
            fats: Number(food.fats) || 0,
          })),
      };

      if (payload.foods.length === 0) {
        throw new Error("Please add at least one food item.");
      }

      await api.post("/meals", payload);

      await fetchMeals();

      resetForm();
      setMessage("Meal added successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Failed to add meal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meal?"
    );

    if (!confirmDelete) return;

    setMessage("");
    setError("");

    try {
      await api.delete(`/meals/${id}`);
      await fetchMeals();
      setMessage("Meal deleted successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete meal.");
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

  const formTotals = calculateFormTotals();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Meal & Diet Tracker</h1>
        <p className="text-slate-400">
          Log meals, calories, protein, carbs, and fats.
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
          <p className="text-sm text-slate-400">Calories Today</p>
          <h2 className="mt-2 text-3xl font-bold">
            {summary?.totalCalories || 0}
            <span className="text-base text-slate-400"> kcal</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Protein Today</p>
          <h2 className="mt-2 text-3xl font-bold">
            {summary?.totalProtein || 0}
            <span className="text-base text-slate-400"> g</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Carbs Today</p>
          <h2 className="mt-2 text-3xl font-bold">
            {summary?.totalCarbs || 0}
            <span className="text-base text-slate-400"> g</span>
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Fats Today</p>
          <h2 className="mt-2 text-3xl font-bold">
            {summary?.totalFats || 0}
            <span className="text-base text-slate-400"> g</span>
          </h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-xl font-semibold mb-5">Add Meal</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Meal Type
              </label>
              <select
                name="mealType"
                value={formData.mealType}
                onChange={handleMainChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
                <option value="pre_workout">Pre-workout</option>
                <option value="post_workout">Post-workout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Notes</label>
              <input
                name="notes"
                value={formData.notes}
                onChange={handleMainChange}
                placeholder="Example: high protein breakfast"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Food Items</h3>

              <button
                type="button"
                onClick={addFoodRow}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <Plus size={16} />
                Add Food
              </button>
            </div>

            <div className="space-y-4">
              {formData.foods.map((food, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-300">
                      Food {index + 1}
                    </p>

                    {formData.foods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodRow(index)}
                        className="text-red-300 hover:text-red-200"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">
                        Food Name
                      </label>

                      <input
                        list="food-list"
                        value={food.name}
                        onChange={(e) =>
                          handleFoodNameChange(index, e.target.value)
                        }
                        placeholder="Chicken Breast"
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />

                      <datalist id="food-list">
                        {foods.map((item) => (
                          <option key={item._id} value={item.name} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Quantity
                      </label>
                      <input
                        value={food.quantity}
                        onChange={(e) =>
                          handleFoodChange(index, "quantity", e.target.value)
                        }
                        placeholder="100g"
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Calories
                      </label>
                      <input
                        type="number"
                        value={food.calories}
                        onChange={(e) =>
                          handleFoodChange(index, "calories", e.target.value)
                        }
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Protein
                      </label>
                      <input
                        type="number"
                        value={food.protein}
                        onChange={(e) =>
                          handleFoodChange(index, "protein", e.target.value)
                        }
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Carbs
                      </label>
                      <input
                        type="number"
                        value={food.carbs}
                        onChange={(e) =>
                          handleFoodChange(index, "carbs", e.target.value)
                        }
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="mt-3 w-full md:w-40">
                    <label className="block text-xs text-slate-400 mb-1">
                      Fats
                    </label>
                    <input
                      type="number"
                      value={food.fats}
                      onChange={(e) =>
                        handleFoodChange(index, "fats", e.target.value)
                      }
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Meal Calories</p>
              <h3 className="text-xl font-bold">{formTotals.calories}</h3>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Protein</p>
              <h3 className="text-xl font-bold">{formTotals.protein}g</h3>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Carbs</p>
              <h3 className="text-xl font-bold">{formTotals.carbs}g</h3>
            </div>
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Fats</p>
              <h3 className="text-xl font-bold">{formTotals.fats}g</h3>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Meal"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit">
          <h2 className="text-xl font-semibold mb-4">Meal Summary</h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Meals Logged</p>
              <h3 className="text-3xl font-bold">{meals.length}</h3>
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              <p className="text-sm text-slate-400">Latest Meal</p>
              <h3 className="text-lg font-semibold mt-1 capitalize">
                {meals[0]?.mealType?.replace("_", " ") || "No meal yet"}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-5">Meal History</h2>

        {meals.length === 0 ? (
          <div className="text-slate-400">No meals logged yet.</div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div
                key={meal._id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Utensils size={18} className="text-orange-400" />
                      <h3 className="font-semibold text-lg capitalize">
                        {meal.mealType?.replace("_", " ")}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-400 mt-1">
                      {new Date(meal.date).toLocaleDateString()} •{" "}
                      {meal.totalCalories || 0} kcal •{" "}
                      {meal.totalProtein || 0}g protein
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {meal.foods?.map((food, index) => (
                        <span
                          key={index}
                          className="rounded-lg bg-slate-800 px-3 py-1 text-sm text-slate-300"
                        >
                          {food.name} ({food.quantity || "serving"}) —{" "}
                          {food.calories} kcal
                        </span>
                      ))}
                    </div>

                    {meal.notes && (
                      <p className="text-sm text-slate-400 mt-3">
                        {meal.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMeal(meal._id)}
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

export default Meals;