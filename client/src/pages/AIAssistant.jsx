import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import api from "../services/api";
import { Button, Card, Badge, Input } from "../components/ui";

const defaultRecommendations = {
  goal: "Fat Loss & Metabolic Conditioning",
  motivationalQuote:
    "Consistency beats intensity. Showing up today is another brick in your foundation.",
  suggestedPlan: {
    title: "HIIT + Functional Circuit",
    focus: "Metabolic conditioning & caloric expenditure",
    exercises: [
      { name: "Goblet Squats", sets: 3, reps: "12-15", rest: "60s" },
      { name: "Dumbbell Push Press", sets: 3, reps: "10-12", rest: "60s" },
      { name: "Kettlebell Swings", sets: 3, reps: "15-20", rest: "45s" },
    ],
  },
  nutritionGuidelines: {
    calorieTarget: 2100,
    proteinGrams: 150,
    carbsGrams: 180,
    fatsGrams: 60,
    hydrationLiters: 3.2,
    tips: [
      "Distribute protein intake evenly across 3-4 meals to maximize muscle protein synthesis.",
      "Prioritize whole nutrient-dense carbohydrates 60-90 minutes before your workout.",
    ],
  },
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "ai",
      text: "Hello! I am your Fitness Buddy Pro AI Assistant. I can help architect structured training splits, calculate macronutrient distribution, explain lift mechanics, and optimize your weekly recovery protocols. What are your primary goals today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(defaultRecommendations);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const chatEndRef = useRef(null);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await api.get("/v1/ai/recommendations");
      if (res.data?.data) {
        setRecommendations(res.data.data);
      }
    } catch {
      setRecommendations(defaultRecommendations);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.get("/v1/ai/recommendations")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setRecommendations(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: userText },
    ]);

    setLoading(true);

    try {
      const res = await api.post("/v1/ai/chat", { message: userText });
      const replyData = res.data?.data || res.data;
      const replyText =
        replyData?.reply ||
        "Prioritize progressive overload, hit your daily protein goal, and ensure 7-8 hours of quality sleep for recovery!";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: replyText,
          isWarning: replyData?.category === "medical_warning",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Ensure progressive overload across your main compound movements, log every session accurately, and consume 1.6–2.0g protein per kg of body weight for optimal tissue remodeling.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Fitness Assistant
            </h1>
            <Badge variant="purple" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Evidence-Based
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Science-backed training routines, macro breakdowns, and real-time form guidance with strict medical safety guardrails.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchRecommendations}
          loading={loadingRecs}
          icon={RefreshCw}
        >
          Regenerate Insights
        </Button>
      </div>

      {/* Safety Notice Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300">Safety Notice:</strong> All training advice and nutrition calculations are for general fitness optimization and educational purposes. If you experience acute pain, dizziness, or medical symptoms, consult a licensed healthcare professional immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personalized Plan & Macros */}
        <div className="lg:col-span-1 space-y-6">
          {recommendations && (
            <>
              {/* Daily Motivational Insight */}
              <Card glow>
                <div className="flex items-center gap-2 text-teal-400 mb-2 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Daily Mindset</span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{recommendations.motivationalQuote}"
                </p>
              </Card>

              {/* Recommended Routine Card */}
              <Card glow>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Recommended Routine
                  </span>
                  <Badge variant="teal" size="sm">
                    {recommendations.goal || "Optimization"}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {recommendations.suggestedPlan?.title}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {recommendations.suggestedPlan?.focus}
                </p>

                <div className="space-y-2">
                  {recommendations.suggestedPlan?.exercises?.map((ex, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-white">{ex.name}</span>
                      <span className="text-slate-400 font-mono">
                        {ex.sets ? `${ex.sets} sets × ${ex.reps}` : ex.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Macro Distribution Card */}
              <Card glow>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-3">
                  Optimal Daily Macros
                </span>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Protein</span>
                    <span className="text-sm font-extrabold text-teal-300">
                      {recommendations.nutritionGuidelines?.proteinGrams}g
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Carbs</span>
                    <span className="text-sm font-extrabold text-amber-300">
                      {recommendations.nutritionGuidelines?.carbsGrams}g
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Fats</span>
                    <span className="text-sm font-extrabold text-cyan-300">
                      {recommendations.nutritionGuidelines?.fatsGrams}g
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {recommendations.nutritionGuidelines?.tips?.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Right Column: Interactive AI Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[650px] flex flex-col justify-between p-4 sm:p-6" glow>
            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium"
                        : msg.isWarning
                        ? "bg-red-500/15 border border-red-500/30 text-red-200"
                        : "bg-slate-800/80 border border-white/5 text-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="italic">AI Coach is analyzing...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Prompt Quick Suggestions */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 text-[11px] text-slate-400 no-scrollbar">
              <button
                type="button"
                onClick={() => setInputMessage("How much protein do I need to build muscle?")}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors shrink-0"
              >
                Protein target
              </button>
              <button
                type="button"
                onClick={() => setInputMessage("What is the proper form cue for barbell squats?")}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors shrink-0"
              >
                Squat form
              </button>
              <button
                type="button"
                onClick={() => setInputMessage("How should I warm up to prevent shoulder impingement?")}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors shrink-0"
              >
                Warm-up routine
              </button>
            </div>

            {/* Input Field Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Input
                placeholder="Ask about workouts, form cues, macronutrients, or recovery..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary" size="md" disabled={loading} icon={Send}>
                Send
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
