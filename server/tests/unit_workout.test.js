const test = require("node:test");
const assert = require("node:assert");

// Standard MET and Calorie formula used in Fitness Buddy Pro:
// Calories = (MET * 3.5 * weightKg * durationMinutes) / 200
const calculateCalories = (met, weightKg, durationMinutes) => {
  if (!met || !weightKg || !durationMinutes) return 0;
  return Math.round(((met * 3.5 * weightKg * durationMinutes) / 200) * 10) / 10;
};

// Mifflin-St Jeor formula for BMR
const calculateBMR = (gender, weightKg, heightCm, age) => {
  const genderOffset = gender === "male" ? 5 : gender === "female" ? -161 : -78;
  return Math.round((10 * weightKg + 6.25 * heightCm - 5 * age + genderOffset) * 10) / 10;
};

test("Workout & Progress Math Unit Tests", async (t) => {
  await t.test("Calorie expenditure estimation conforms to ACSM MET guidelines", () => {
    // 70kg runner at MET 9 for 30 minutes
    const calories = calculateCalories(9, 70, 30);
    // (9 * 3.5 * 70 * 30) / 200 = 330.75 -> 330.8
    assert.strictEqual(calories, 330.8);

    // Zero duration yields 0 calories
    assert.strictEqual(calculateCalories(9, 70, 0), 0);
  });

  await t.test("Mifflin-St Jeor BMR formula accurately computes basal metabolic rate", () => {
    // Male: 80kg, 180cm, 25 years old -> 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
    const maleBMR = calculateBMR("male", 80, 180, 25);
    assert.strictEqual(maleBMR, 1805);

    // Female: 60kg, 165cm, 28 years old -> 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330.3
    const femaleBMR = calculateBMR("female", 60, 165, 28);
    assert.strictEqual(femaleBMR, 1330.3);
  });
});
