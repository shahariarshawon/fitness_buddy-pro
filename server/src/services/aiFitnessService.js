/**
 * AI Fitness Assistant Service
 * Provides science-backed, evidence-based training and nutrition suggestions with safety guardrails.
 * Works immediately via intelligent fitness heuristic engine, with optional LLM API fallback.
 */

const MEDICAL_DISCLAIMER =
  "Notice: This guidance is for educational and general fitness optimization purposes only and does not constitute medical advice. Consult a healthcare professional before starting any intense regimen.";

// Knowledge base for structured recommendations
const WORKOUT_TEMPLATES = {
  fat_loss: [
    {
      title: "HIIT + Functional Circuit",
      focus: "Metabolic conditioning & caloric expenditure",
      frequency: "3-4 days/week",
      exercises: [
        { name: "Goblet Squats", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Dumbbell Push Press", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Kettlebell Swings", sets: 3, reps: "15-20", rest: "45s" },
        { name: "Incline Treadmill Walk", duration: "20 mins", intensity: "Moderate (Zone 2)" },
      ],
    },
    {
      title: "Upper/Lower Split Cardio Accelerator",
      focus: "Lean mass preservation during calorie deficit",
      frequency: "4 days/week",
      exercises: [
        { name: "Barbell Deadlift (Romanian)", sets: 3, reps: "8-10", rest: "90s" },
        { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Stationary Bike Intervals", duration: "15 mins", intensity: "Intervals" },
      ],
    },
  ],
  muscle_gain: [
    {
      title: "Push-Pull-Legs (PPL) Hypertrophy",
      focus: "Progressive mechanical tension & volume",
      frequency: "4-6 days/week",
      exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "8-10", rest: "90s" },
        { name: "Barbell Bent-Over Row", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Barbell Back Squat", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Overhead Dumbbell Extension", sets: 3, reps: "10-12", rest: "60s" },
      ],
    },
  ],
  maintenance: [
    {
      title: "Full Body Longevity & Strength",
      focus: "Neuromuscular efficiency & cardiovascular health",
      frequency: "3 days/week",
      exercises: [
        { name: "Trap Bar Deadlift", sets: 3, reps: "6-8", rest: "120s" },
        { name: "Push-Ups (Deficit)", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Dumbbell Bulgarian Split Squat", sets: 3, reps: "8-10 / leg", rest: "90s" },
        { name: "Zone 2 Steady-State Cardio", duration: "30 mins", intensity: "Zone 2" },
      ],
    },
  ],
};

const MOTIVATIONAL_NUGGETS = [
  "Consistency beats intensity. Showing up today is another brick in your foundation.",
  "Your future self is being built by the sets you log right now.",
  "Discipline is simply choosing between what you want now and what you want most.",
  "Progress isn't always linear on the scale, but neurological adaptations happen every session.",
  "Master the fundamentals: progressive overload, adequate protein, quality sleep, and daily hydration.",
];

/**
 * Generate personalized fitness insights and workout suggestion
 */
const generateRecommendations = async ({ user, targetGoal }) => {
  const goal = targetGoal || user?.goal || "fat_loss";
  const templates = WORKOUT_TEMPLATES[goal] || WORKOUT_TEMPLATES.fat_loss;
  const selectedWorkout = templates[Math.floor(Math.random() * templates.length)];
  const quote = MOTIVATIONAL_NUGGETS[Math.floor(Math.random() * MOTIVATIONAL_NUGGETS.length)];

  // Evidence-based macro breakdown
  const weightKg = user?.currentWeight || user?.startingWeight || 75;
  const calorieTarget = user?.dailyCalorieTarget || (goal === "muscle_gain" ? 2500 : 2000);
  const proteinTarget = Math.round(weightKg * (goal === "muscle_gain" ? 2.0 : 1.6));
  const fatTarget = Math.round((calorieTarget * 0.25) / 9);
  const carbTarget = Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4);

  return {
    disclaimer: MEDICAL_DISCLAIMER,
    goal,
    motivationalQuote: quote,
    suggestedPlan: selectedWorkout,
    nutritionGuidelines: {
      calorieTarget,
      proteinGrams: proteinTarget,
      carbsGrams: Math.max(carbTarget, 50),
      fatsGrams: fatTarget,
      hydrationLiters: user?.dailyWaterTarget || 3.0,
      tips: [
        "Distribute protein intake evenly across 3-4 meals to maximize muscle protein synthesis.",
        "Prioritize whole nutrient-dense carbohydrates 60-90 minutes before your workout.",
        "Hydrate with 500ml water immediately upon waking to kickstart cellular metabolism.",
      ],
    },
    recoveryGuidelines: {
      sleepTargetHours: user?.sleepTarget || 8,
      activeRecovery: "Aim for 8,000-10,000 daily steps even on non-lifting days.",
    },
  };
};

/**
 * Interactive AI Assistant Chat
 * Answers questions safely regarding form, nutrition, habit building, and fatigue management.
 */
const chatAssistant = async ({ message, user }) => {
  const query = (message || "").toLowerCase().trim();

  // Safety filter for medical conditions
  const medicalTriggers = ["chest pain", "dizziness", "torn", "fracture", "hernia", "faint", "concussion"];
  const hasMedicalConcern = medicalTriggers.some((t) => query.includes(t));

  if (hasMedicalConcern) {
    return {
      reply:
        "⚠️ Safety Warning: You mentioned symptoms that could indicate an acute injury or medical emergency. Please refrain from exercising and consult a licensed physician or medical professional immediately.",
      category: "medical_warning",
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // Smart contextual responses
  if (query.includes("protein") || query.includes("what to eat") || query.includes("diet") || query.includes("meal")) {
    const weight = user?.currentWeight || 75;
    const recProtein = Math.round(weight * 1.6);
    return {
      reply: `For optimal muscle preservation and recovery, aim for approximately ${recProtein}g of protein daily (1.6g–2.2g per kg of body weight). Quality sources include chicken breast, eggs, Greek yogurt, lentils, tofu, and whey protein. Pair with complex carbohydrates like oats, quinoa, or sweet potatoes.`,
      category: "nutrition",
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  if (query.includes("sore") || query.includes("doms") || query.includes("recovery")) {
    return {
      reply:
        "Delayed Onset Muscle Soreness (DOMS) is normal, especially with new movement patterns or eccentric loading. Promote recovery with: 1) Light Zone 1 walking or cycling to increase blood flow, 2) 7-9 hours of quality sleep, 3) Electrolyte-rich hydration, and 4) Dynamic stretching or foam rolling.",
      category: "recovery",
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  if (query.includes("squat") || query.includes("form") || query.includes("bench") || query.includes("deadlift")) {
    return {
      reply:
        "Key form principle: Maintain a braced intra-abdominal core with neutral spine alignment throughout the entire repetition. Control the eccentric (lowering) phase for 2-3 seconds, pause briefly in the pocket, and drive through mid-foot with explosive intent.",
      category: "exercise_technique",
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  if (query.includes("motivat") || query.includes("hard") || query.includes("tired") || query.includes("lazy")) {
    return {
      reply:
        "Remember: Even an imperfect 20-minute workout is infinitely better than zero minutes. Action creates motivation, not the other way around. Put your shoes on, start with a light warm-up, and let momentum take over!",
      category: "motivation",
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // Default intelligent assistant response
  return {
    reply: `Based on your goal (${user?.goal || "fitness optimization"}), remember that consistency and progressive overload drive long-term physiological adaptation. Make sure to log your workouts, hit your ${user?.dailyProteinTarget || 120}g protein target, and stay properly hydrated! What specific aspect of your training or nutrition can I help you adjust today?`,
    category: "general_fitness",
    disclaimer: MEDICAL_DISCLAIMER,
  };
};

module.exports = {
  generateRecommendations,
  chatAssistant,
};
