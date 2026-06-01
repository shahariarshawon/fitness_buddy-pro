import { useEffect, useState } from "react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: "",
    gender: "",
    goal: "fat_loss",
    activityLevel: "moderate",
    startingWeight: "",
    targetWeight: "",
    dailyCalorieTarget: "",
    dailyProteinTarget: "",
    dailyWaterTarget: "",
    sleepTarget: "",
    unitSystem: "metric",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    api
      .get("/users/profile")
      .then((response) => {
        const user = response.data.user;

        if (isMounted) {
          setFormData({
            name: user.name || "",
            age: user.age || "",
            height: user.height || "",
            gender: user.gender || "",
            goal: user.goal || "fat_loss",
            activityLevel: user.activityLevel || "moderate",
            startingWeight: user.startingWeight || "",
            targetWeight: user.targetWeight || "",
            dailyCalorieTarget: user.dailyCalorieTarget || "",
            dailyProteinTarget: user.dailyProteinTarget || "",
            dailyWaterTarget: user.dailyWaterTarget || "",
            sleepTarget: user.sleepTarget || "",
            unitSystem: user.unitSystem || "metric",
          });
        }
      })
      .catch((error) => {
        console.error("Profile fetch error:", error.response?.data || error);

        if (isMounted) {
          setError("Failed to load profile.");
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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : null,
        height: formData.height ? Number(formData.height) : null,
        startingWeight: formData.startingWeight
          ? Number(formData.startingWeight)
          : null,
        targetWeight: formData.targetWeight
          ? Number(formData.targetWeight)
          : null,
        dailyCalorieTarget: formData.dailyCalorieTarget
          ? Number(formData.dailyCalorieTarget)
          : null,
        dailyProteinTarget: formData.dailyProteinTarget
          ? Number(formData.dailyProteinTarget)
          : null,
        dailyWaterTarget: formData.dailyWaterTarget
          ? Number(formData.dailyWaterTarget)
          : null,
        sleepTarget: formData.sleepTarget ? Number(formData.sleepTarget) : null,
      };

      await api.put("/users/profile", payload);

      setMessage("Profile updated successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await api.put("/users/change-password", passwordData);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setSaving(false);
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-slate-400">
          Set your goals, body details, and daily targets.
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
          onSubmit={handleProfileSubmit}
          className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-5"
        >
          <h2 className="text-xl font-semibold mb-5">Personal Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Age</label>
              <input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Height {formData.unitSystem === "metric" ? "(cm)" : "(inch)"}
              </label>
              <input
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Activity Level
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Starting Weight
              </label>
              <input
                name="startingWeight"
                type="number"
                value={formData.startingWeight}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Target Weight
              </label>
              <input
                name="targetWeight"
                type="number"
                value={formData.targetWeight}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Daily Calorie Target
              </label>
              <input
                name="dailyCalorieTarget"
                type="number"
                value={formData.dailyCalorieTarget}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Daily Protein Target
              </label>
              <input
                name="dailyProteinTarget"
                type="number"
                value={formData.dailyProteinTarget}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Daily Water Target
              </label>
              <input
                name="dailyWaterTarget"
                type="number"
                step="0.1"
                value={formData.dailyWaterTarget}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Sleep Target
              </label>
              <input
                name="sleepTarget"
                type="number"
                value={formData.sleepTarget}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Unit System
              </label>
              <select
                name="unitSystem"
                value={formData.unitSystem}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 h-fit"
        >
          <h2 className="text-xl font-semibold mb-5">Change Password</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Current Password
              </label>
              <input
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                New Password
              </label>
              <input
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;