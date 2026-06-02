import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle,
  Droplets,
  Dumbbell,
  Eye,
  EyeOff,
  Flame,
  Footprints,
  HeartPulse,
  Lock,
  Moon,
  RefreshCcw,
  Save,
  Scale,
  Shield,
  Sparkles,
  Target,
  User,
  Utensils,
} from "lucide-react";
import api from "../services/api";
import PageLoader from "../components/common/PageLoader";

const defaultFormData = {
  name: "",
  avatarUrl: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  height: "",
  currentWeight: "",
  startingWeight: "",
  targetWeight: "",

  goal: "fat_loss",
  trainingBackground: "",
  trainingExperienceMonths: "",
  activityLevel: "moderate",

  dailyCalorieTarget: "",
  dailyProteinTarget: "",
  dailyWaterTarget: "",
  sleepTarget: "",

  dailyTargets: {
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
    waterLiters: "",
    steps: "",
    sleepHours: "",
    workoutDaysPerWeek: "",
  },

  weeklyTargets: {
    workoutDays: "",
    cardioMinutes: "",
    strengthSessions: "",
    activeRecoveryDays: "",
    progressPhotoFrequency: "weekly",
    checkInFrequency: "weekly",
  },

  unitSystem: "metric",
  weightUnit: "kg",
  measurementUnit: "cm",
  foodMeasurementPreference: "both",

  schedulePreferences: {
    preferredWorkoutTime: "evening",
    workoutDays: [],
    sleepTime: "",
    wakeTime: "",
  },

  notificationPreferences: {
    workoutReminder: true,
    mealReminder: true,
    waterReminder: true,
    sleepReminder: true,
    progressReminder: true,
  },

  safetyProfile: {
    kneePain: false,
    backPain: false,
    shoulderPain: false,
    medicalClearanceRecommended: false,
    notes: "",
  },
};

const weekdayOptions = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const numberFields = [
  "age",
  "height",
  "currentWeight",
  "startingWeight",
  "targetWeight",
  "trainingExperienceMonths",
  "dailyCalorieTarget",
  "dailyProteinTarget",
  "dailyWaterTarget",
  "sleepTarget",
];

const nestedNumberFields = {
  dailyTargets: [
    "calories",
    "protein",
    "carbs",
    "fats",
    "fiber",
    "waterLiters",
    "steps",
    "sleepHours",
    "workoutDaysPerWeek",
  ],
  weeklyTargets: [
    "workoutDays",
    "cardioMinutes",
    "strengthSessions",
    "activeRecoveryDays",
  ],
};

const toDateInput = (dateInput) => {
  if (!dateInput) return "";

  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) return "";

  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

const toInputValue = (value) => {
  if (value === null || value === undefined) return "";
  return value;
};

const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "--";

  const number = Number(value);

  if (Number.isNaN(number)) return "--";

  return number.toFixed(decimals);
};

const buildFormDataFromUser = (user = {}) => {
  const dailyTargets = user.dailyTargets || {};
  const weeklyTargets = user.weeklyTargets || {};
  const schedulePreferences = user.schedulePreferences || {};
  const notificationPreferences = user.notificationPreferences || {};
  const safetyProfile = user.safetyProfile || {};

  return {
    ...defaultFormData,

    name: user.name || "",
    avatarUrl: user.avatarUrl || "",
    dateOfBirth: toDateInput(user.dateOfBirth),
    age: toInputValue(user.age),
    gender: user.gender || "",
    height: toInputValue(user.height),
    currentWeight: toInputValue(user.currentWeight),
    startingWeight: toInputValue(user.startingWeight),
    targetWeight: toInputValue(user.targetWeight),

    goal: user.goal || "fat_loss",
    trainingBackground: user.trainingBackground || "",
    trainingExperienceMonths: toInputValue(user.trainingExperienceMonths),
    activityLevel: user.activityLevel || "moderate",

    dailyCalorieTarget: toInputValue(user.dailyCalorieTarget),
    dailyProteinTarget: toInputValue(user.dailyProteinTarget),
    dailyWaterTarget: toInputValue(user.dailyWaterTarget),
    sleepTarget: toInputValue(user.sleepTarget),

    dailyTargets: {
      calories: toInputValue(
        dailyTargets.calories || user.dailyCalorieTarget || ""
      ),
      protein: toInputValue(
        dailyTargets.protein || user.dailyProteinTarget || ""
      ),
      carbs: toInputValue(dailyTargets.carbs || ""),
      fats: toInputValue(dailyTargets.fats || ""),
      fiber: toInputValue(dailyTargets.fiber || ""),
      waterLiters: toInputValue(
        dailyTargets.waterLiters || user.dailyWaterTarget || ""
      ),
      steps: toInputValue(dailyTargets.steps || ""),
      sleepHours: toInputValue(dailyTargets.sleepHours || user.sleepTarget || ""),
      workoutDaysPerWeek: toInputValue(dailyTargets.workoutDaysPerWeek || ""),
    },

    weeklyTargets: {
      workoutDays: toInputValue(weeklyTargets.workoutDays || ""),
      cardioMinutes: toInputValue(weeklyTargets.cardioMinutes || ""),
      strengthSessions: toInputValue(weeklyTargets.strengthSessions || ""),
      activeRecoveryDays: toInputValue(weeklyTargets.activeRecoveryDays || ""),
      progressPhotoFrequency:
        weeklyTargets.progressPhotoFrequency || "weekly",
      checkInFrequency: weeklyTargets.checkInFrequency || "weekly",
    },

    unitSystem: user.unitSystem || "metric",
    weightUnit: user.weightUnit || "kg",
    measurementUnit: user.measurementUnit || "cm",
    foodMeasurementPreference: user.foodMeasurementPreference || "both",

    schedulePreferences: {
      preferredWorkoutTime:
        schedulePreferences.preferredWorkoutTime || "evening",
      workoutDays: Array.isArray(schedulePreferences.workoutDays)
        ? schedulePreferences.workoutDays
        : [],
      sleepTime: schedulePreferences.sleepTime || "",
      wakeTime: schedulePreferences.wakeTime || "",
    },

    notificationPreferences: {
      workoutReminder:
        notificationPreferences.workoutReminder !== undefined
          ? notificationPreferences.workoutReminder
          : true,
      mealReminder:
        notificationPreferences.mealReminder !== undefined
          ? notificationPreferences.mealReminder
          : true,
      waterReminder:
        notificationPreferences.waterReminder !== undefined
          ? notificationPreferences.waterReminder
          : true,
      sleepReminder:
        notificationPreferences.sleepReminder !== undefined
          ? notificationPreferences.sleepReminder
          : true,
      progressReminder:
        notificationPreferences.progressReminder !== undefined
          ? notificationPreferences.progressReminder
          : true,
    },

    safetyProfile: {
      kneePain: Boolean(safetyProfile.kneePain),
      backPain: Boolean(safetyProfile.backPain),
      shoulderPain: Boolean(safetyProfile.shoulderPain),
      medicalClearanceRecommended: Boolean(
        safetyProfile.medicalClearanceRecommended
      ),
      notes: safetyProfile.notes || "",
    },
  };
};

const cleanPayload = (formData) => {
  const payload = {
    ...formData,
    dailyTargets: { ...formData.dailyTargets },
    weeklyTargets: { ...formData.weeklyTargets },
    schedulePreferences: { ...formData.schedulePreferences },
    notificationPreferences: { ...formData.notificationPreferences },
    safetyProfile: { ...formData.safetyProfile },
  };

  numberFields.forEach((field) => {
    if (payload[field] === "") {
      delete payload[field];
    } else {
      payload[field] = Number(payload[field]);
    }
  });

  Object.keys(nestedNumberFields).forEach((group) => {
    nestedNumberFields[group].forEach((field) => {
      if (payload[group][field] === "") {
        delete payload[group][field];
      } else {
        payload[group][field] = Number(payload[group][field]);
      }
    });
  });

  if (!payload.dateOfBirth) {
    delete payload.dateOfBirth;
  }

  if (!payload.avatarUrl) {
    delete payload.avatarUrl;
  }

  payload.dailyCalorieTarget =
    payload.dailyTargets.calories || payload.dailyCalorieTarget;
  payload.dailyProteinTarget =
    payload.dailyTargets.protein || payload.dailyProteinTarget;
  payload.dailyWaterTarget =
    payload.dailyTargets.waterLiters || payload.dailyWaterTarget;
  payload.sleepTarget = payload.dailyTargets.sleepHours || payload.sleepTarget;

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

const Profile = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [recommendations, setRecommendations] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSection, setSavingSection] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getProfilePageData = async () => {
    const [profileResponse, recommendationResponse] = await Promise.all([
      api.get("/users/profile"),
      api.get("/users/recommendations").catch(() => ({ data: null })),
    ]);

    return {
      user: profileResponse.data.user,
      recommendationsData: recommendationResponse.data?.recommendations || null,
    };
  };

  const applyProfilePageData = ({ user, recommendationsData }) => {
    setFormData(buildFormDataFromUser(user));
    setRecommendations(recommendationsData);
  };

  const refreshProfile = async () => {
    const data = await getProfilePageData();
    applyProfilePageData(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await getProfilePageData();

        if (!isMounted) return;

        applyProfilePageData(data);
      } catch (error) {
        console.error("Profile fetch error:", error.response?.data || error);

        if (isMounted) {
          setError(error.response?.data?.message || "Failed to load profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const profileSummary = useMemo(() => {
    const heightMeter = Number(formData.height || 0) / 100;
    const weight = Number(formData.currentWeight || formData.startingWeight || 0);

    const bmi =
      heightMeter > 0 && weight > 0
        ? Number((weight / (heightMeter * heightMeter)).toFixed(1))
        : recommendations?.bmi || "--";

    const targetWeight = Number(formData.targetWeight || 0);
    const weightToTarget =
      targetWeight > 0 && weight > 0
        ? Number((weight - targetWeight).toFixed(1))
        : "--";

    return {
      bmi,
      weight,
      weightToTarget,
      calories:
        formData.dailyTargets.calories ||
        formData.dailyCalorieTarget ||
        recommendations?.calories?.current ||
        "--",
      protein:
        formData.dailyTargets.protein ||
        formData.dailyProteinTarget ||
        recommendations?.protein?.current ||
        "--",
    };
  }, [formData, recommendations]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedCheckbox = (section, field) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field],
      },
    }));
  };

  const handleWorkoutDayToggle = (day) => {
    setFormData((prev) => {
      const currentDays = prev.schedulePreferences.workoutDays || [];
      const nextDays = currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day];

      return {
        ...prev,
        schedulePreferences: {
          ...prev.schedulePreferences,
          workoutDays: nextDays,
        },
      };
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setSavingProfile(true);
    setMessage("");
    setError("");

    try {
      await api.put("/users/profile", cleanPayload(formData));
      await refreshProfile();
      setMessage("Profile updated successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTargetsSubmit = async () => {
    setSavingSection("targets");
    setMessage("");
    setError("");

    try {
      await api.put("/users/targets", {
        dailyCalorieTarget: formData.dailyTargets.calories
          ? Number(formData.dailyTargets.calories)
          : undefined,
        dailyProteinTarget: formData.dailyTargets.protein
          ? Number(formData.dailyTargets.protein)
          : undefined,
        dailyWaterTarget: formData.dailyTargets.waterLiters
          ? Number(formData.dailyTargets.waterLiters)
          : undefined,
        sleepTarget: formData.dailyTargets.sleepHours
          ? Number(formData.dailyTargets.sleepHours)
          : undefined,
        dailyTargets: cleanPayload(formData).dailyTargets,
        weeklyTargets: cleanPayload(formData).weeklyTargets,
      });

      await refreshProfile();
      setMessage("Targets updated successfully.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update targets.");
    } finally {
      setSavingSection("");
    }
  };

  const handleScheduleSubmit = async () => {
    setSavingSection("schedule");
    setMessage("");
    setError("");

    try {
      await api.put("/users/schedule-preferences", formData.schedulePreferences);
      await refreshProfile();
      setMessage("Schedule preferences updated successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update schedule preferences."
      );
    } finally {
      setSavingSection("");
    }
  };

  const handleNotificationSubmit = async () => {
    setSavingSection("notifications");
    setMessage("");
    setError("");

    try {
      await api.put(
        "/users/notification-preferences",
        formData.notificationPreferences
      );
      await refreshProfile();
      setMessage("Notification preferences updated successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update notification preferences."
      );
    } finally {
      setSavingSection("");
    }
  };

  const handleSafetySubmit = async () => {
    setSavingSection("safety");
    setMessage("");
    setError("");

    try {
      await api.put("/users/safety-profile", formData.safetyProfile);
      await refreshProfile();
      setMessage("Safety profile updated successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update safety profile."
      );
    } finally {
      setSavingSection("");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setSavingPassword(true);
    setMessage("");
    setError("");

    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error("Current password and new password are required.");
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }

      await api.put("/users/change-password", passwordData);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading profile"
        message="Preparing your profile, targets, preferences, and recommendations."
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
              Profile & Fitness Targets
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Profile settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Manage body details, transformation goal, calories, macros,
              weekly targets, reminders, safety settings, and password.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshProfile}
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
          value={formatNumber(profileSummary.weight, 1)}
          suffix={formData.weightUnit || "kg"}
          helper="Used for workout calorie estimates"
          icon={Scale}
        />

        <StatCard
          title="BMI"
          value={profileSummary.bmi}
          helper="Auto-calculated by profile"
          icon={HeartPulse}
        />

        <StatCard
          title="Calories"
          value={profileSummary.calories}
          suffix="kcal"
          helper="Daily calorie target"
          icon={Flame}
        />

        <StatCard
          title="Protein"
          value={profileSummary.protein}
          suffix="g"
          helper="Daily protein target"
          icon={Target}
        />

        <StatCard
          title="To Target"
          value={profileSummary.weightToTarget}
          suffix={
            profileSummary.weightToTarget !== "--" ? formData.weightUnit || "kg" : ""
          }
          helper="Current minus target"
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main profile form */}
        <form
          onSubmit={handleProfileSubmit}
          className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Personal information
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                These fields support BMI, BMR, recommendations, and daily targets.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
              <User size={21} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Field
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <Field
              label="Avatar URL"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://..."
            />

            <Field
              label="Date of birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <Field
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
            />

            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectField>

            <Field
              label="Height, cm"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              min="1"
              step="0.1"
            />

            <Field
              label="Current weight"
              name="currentWeight"
              type="number"
              value={formData.currentWeight}
              onChange={handleChange}
              min="1"
              step="0.1"
            />

            <Field
              label="Starting weight"
              name="startingWeight"
              type="number"
              value={formData.startingWeight}
              onChange={handleChange}
              min="1"
              step="0.1"
            />

            <Field
              label="Target weight"
              name="targetWeight"
              type="number"
              value={formData.targetWeight}
              onChange={handleChange}
              min="1"
              step="0.1"
            />

            <SelectField
              label="Goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
            >
              <option value="fat_loss">Fat loss</option>
              <option value="muscle_gain">Muscle gain</option>
              <option value="recomposition">Recomposition</option>
              <option value="maintenance">Maintenance</option>
              <option value="general_fitness">General fitness</option>
            </SelectField>

            <SelectField
              label="Activity level"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </SelectField>

            <SelectField
              label="Training background"
              name="trainingBackground"
              value={formData.trainingBackground}
              onChange={handleChange}
            >
              <option value="">Select background</option>
              <option value="complete_beginner">Complete beginner</option>
              <option value="former_trainee">Former trainee</option>
              <option value="currently_training">Currently training</option>
              <option value="athlete">Athlete</option>
            </SelectField>

            <Field
              label="Training experience, months"
              name="trainingExperienceMonths"
              type="number"
              value={formData.trainingExperienceMonths}
              onChange={handleChange}
              min="0"
            />

            <SelectField
              label="Unit system"
              name="unitSystem"
              value={formData.unitSystem}
              onChange={handleChange}
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </SelectField>

            <SelectField
              label="Weight unit"
              name="weightUnit"
              value={formData.weightUnit}
              onChange={handleChange}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </SelectField>

            <SelectField
              label="Measurement unit"
              name="measurementUnit"
              value={formData.measurementUnit}
              onChange={handleChange}
            >
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </SelectField>

            <SelectField
              label="Food measurement"
              name="foodMeasurementPreference"
              value={formData.foodMeasurementPreference}
              onChange={handleChange}
            >
              <option value="both">Regular scales + grams</option>
              <option value="regular_scales">Regular scales only</option>
              <option value="grams">Grams only</option>
            </SelectField>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* Password + recommendations */}
        <div className="space-y-6">
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Change password
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Keep your account secure.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587]/20 to-[#00809d]/20 text-[#9ff7ec] ring-1 ring-white/10">
                <Lock size={21} />
              </div>
            </div>

            <div className="space-y-4">
              <Field
                label="Current password"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />

              <Field
                label="New password"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Minimum 6 characters"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPassword ? "Hide password" : "Show password"}
              </button>

              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Shield size={18} />
                {savingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
            <h2 className="text-xl font-semibold tracking-tight">
              Recommendations
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              From the upgraded backend recommendation endpoint.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Recommended calories</p>
                <p className="mt-1 text-2xl font-bold">
                  {recommendations?.calories?.recommended || "--"} kcal
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Recommended protein</p>
                <p className="mt-1 text-2xl font-bold">
                  {recommendations?.protein?.recommended || "--"} g
                </p>
              </div>

              {recommendations?.message && (
                <div
                  className={`rounded-2xl p-4 text-sm leading-6 ${
                    recommendations?.safety?.medicalClearanceRecommended
                      ? "border border-yellow-400/20 bg-yellow-500/10 text-yellow-100"
                      : "border border-[#009587]/25 bg-[#009587]/10 text-[#9ff7ec]"
                  }`}
                >
                  {recommendations?.safety?.medicalClearanceRecommended && (
                    <AlertTriangle size={17} className="mb-2" />
                  )}
                  {recommendations.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Targets */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Daily and weekly targets
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              These targets are used by Dashboard, Today, Meals, Habits, Reports,
              and Plans.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTargetsSubmit}
            disabled={savingSection === "targets"}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {savingSection === "targets" ? "Saving..." : "Save Targets"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field
            label="Calories"
            type="number"
            value={formData.dailyTargets.calories}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "calories", e.target.value)
            }
            icon={Flame}
          />

          <Field
            label="Protein, g"
            type="number"
            value={formData.dailyTargets.protein}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "protein", e.target.value)
            }
          />

          <Field
            label="Carbs, g"
            type="number"
            value={formData.dailyTargets.carbs}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "carbs", e.target.value)
            }
          />

          <Field
            label="Fats, g"
            type="number"
            value={formData.dailyTargets.fats}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "fats", e.target.value)
            }
          />

          <Field
            label="Fiber, g"
            type="number"
            value={formData.dailyTargets.fiber}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "fiber", e.target.value)
            }
          />

          <Field
            label="Water, litres"
            type="number"
            step="0.1"
            value={formData.dailyTargets.waterLiters}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "waterLiters", e.target.value)
            }
          />

          <Field
            label="Steps"
            type="number"
            value={formData.dailyTargets.steps}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "steps", e.target.value)
            }
          />

          <Field
            label="Sleep, hours"
            type="number"
            step="0.5"
            value={formData.dailyTargets.sleepHours}
            onChange={(e) =>
              handleNestedChange("dailyTargets", "sleepHours", e.target.value)
            }
          />

          <Field
            label="Workout days/week"
            type="number"
            min="0"
            max="7"
            value={formData.dailyTargets.workoutDaysPerWeek}
            onChange={(e) =>
              handleNestedChange(
                "dailyTargets",
                "workoutDaysPerWeek",
                e.target.value
              )
            }
          />

          <Field
            label="Weekly cardio minutes"
            type="number"
            value={formData.weeklyTargets.cardioMinutes}
            onChange={(e) =>
              handleNestedChange("weeklyTargets", "cardioMinutes", e.target.value)
            }
          />

          <Field
            label="Strength sessions/week"
            type="number"
            value={formData.weeklyTargets.strengthSessions}
            onChange={(e) =>
              handleNestedChange(
                "weeklyTargets",
                "strengthSessions",
                e.target.value
              )
            }
          />

          <SelectField
            label="Check-in frequency"
            value={formData.weeklyTargets.checkInFrequency}
            onChange={(e) =>
              handleNestedChange(
                "weeklyTargets",
                "checkInFrequency",
                e.target.value
              )
            }
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </SelectField>
        </div>
      </div>

      {/* Preferences */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Schedule preferences
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Used for reminders and planning.
              </p>
            </div>

            <CalendarClock className="text-[#00c2ad]" size={22} />
          </div>

          <div className="space-y-4">
            <SelectField
              label="Preferred workout time"
              value={formData.schedulePreferences.preferredWorkoutTime}
              onChange={(e) =>
                handleNestedChange(
                  "schedulePreferences",
                  "preferredWorkoutTime",
                  e.target.value
                )
              }
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </SelectField>

            <Field
              label="Sleep time"
              type="time"
              value={formData.schedulePreferences.sleepTime}
              onChange={(e) =>
                handleNestedChange(
                  "schedulePreferences",
                  "sleepTime",
                  e.target.value
                )
              }
            />

            <Field
              label="Wake time"
              type="time"
              value={formData.schedulePreferences.wakeTime}
              onChange={(e) =>
                handleNestedChange(
                  "schedulePreferences",
                  "wakeTime",
                  e.target.value
                )
              }
            />

            <div>
              <p className="mb-2 text-sm text-slate-300">Workout days</p>
              <div className="flex flex-wrap gap-2">
                {weekdayOptions.map((day) => {
                  const active =
                    formData.schedulePreferences.workoutDays.includes(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleWorkoutDayToggle(day)}
                      className={`rounded-2xl px-3 py-2 text-xs font-semibold capitalize transition ${
                        active
                          ? "bg-gradient-to-r from-[#009587] to-[#00809d] text-white"
                          : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleScheduleSubmit}
              disabled={savingSection === "schedule"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {savingSection === "schedule" ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Notifications
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Reminder preferences for daily system.
              </p>
            </div>

            <Bell className="text-[#00c2ad]" size={22} />
          </div>

          <div className="space-y-3">
            {[
              ["workoutReminder", "Workout reminder", Dumbbell],
              ["mealReminder", "Meal reminder", Utensils],
              ["waterReminder", "Water reminder", Droplets],
              ["sleepReminder", "Sleep reminder", Moon],
              ["progressReminder", "Progress reminder", Footprints],
            ].map(([field, label, Icon]) => (
              <button
                key={field}
                type="button"
                onClick={() =>
                  handleNestedCheckbox("notificationPreferences", field)
                }
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  formData.notificationPreferences[field]
                    ? "border-[#009587]/30 bg-[#009587]/15 text-[#9ff7ec]"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {label}
                </span>

                {formData.notificationPreferences[field] && (
                  <CheckCircle size={18} />
                )}
              </button>
            ))}

            <button
              type="button"
              onClick={handleNotificationSubmit}
              disabled={savingSection === "notifications"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {savingSection === "notifications"
                ? "Saving..."
                : "Save Notifications"}
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Safety profile
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Helps avoid risky progression.
              </p>
            </div>

            <Shield className="text-[#00c2ad]" size={22} />
          </div>

          <div className="space-y-3">
            {[
              ["kneePain", "Knee pain"],
              ["backPain", "Back pain"],
              ["shoulderPain", "Shoulder pain"],
              ["medicalClearanceRecommended", "Medical clearance recommended"],
            ].map(([field, label]) => (
              <button
                key={field}
                type="button"
                onClick={() => handleNestedCheckbox("safetyProfile", field)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  formData.safetyProfile[field]
                    ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-100"
                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                <span>{label}</span>
                {formData.safetyProfile[field] && <AlertTriangle size={18} />}
              </button>
            ))}

            <textarea
              value={formData.safetyProfile.notes}
              onChange={(e) =>
                handleNestedChange("safetyProfile", "notes", e.target.value)
              }
              rows="3"
              placeholder="Example: Avoid heavy squats due to knee discomfort."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#009587] focus:ring-4 focus:ring-[#009587]/10"
            />

            <button
              type="button"
              onClick={handleSafetySubmit}
              disabled={savingSection === "safety"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#009587] to-[#00809d] px-5 py-3 font-semibold text-white shadow-lg shadow-[#009587]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {savingSection === "safety" ? "Saving..." : "Save Safety"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;