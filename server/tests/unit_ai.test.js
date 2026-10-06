const test = require("node:test");
const assert = require("node:assert");
const { generateRecommendations, chatAssistant } = require("../src/services/aiFitnessService");

test("AI Fitness Assistant Service Unit Tests", async (t) => {
  await t.test("generateRecommendations generates valid plan, macros and disclaimer", async () => {
    const mockUser = {
      goal: "fat_loss",
      currentWeight: 80,
      dailyCalorieTarget: 2000,
      dailyProteinTarget: 140,
    };

    const result = await generateRecommendations({ user: mockUser });

    assert.ok(result.disclaimer.includes("Notice"));
    assert.strictEqual(result.goal, "fat_loss");
    assert.ok(result.suggestedPlan.exercises.length > 0);
    assert.ok(typeof result.nutritionGuidelines.proteinGrams === "number");
    assert.strictEqual(result.nutritionGuidelines.calorieTarget, 2000);
  });

  await t.test("chatAssistant detects medical warning triggers and returns caution flag", async () => {
    const result = await chatAssistant({
      message: "I feel sharp chest pain when doing bench press",
      user: {},
    });

    assert.strictEqual(result.category, "medical_warning");
    assert.ok(result.reply.includes("Safety Warning"));
  });

  await t.test("chatAssistant responds intelligently to nutrition inquiries", async () => {
    const result = await chatAssistant({
      message: "How much protein should I eat per day?",
      user: { currentWeight: 75 },
    });

    assert.strictEqual(result.category, "nutrition");
    assert.ok(result.reply.includes("protein"));
    assert.ok(result.reply.includes("120g"));
  });
});
