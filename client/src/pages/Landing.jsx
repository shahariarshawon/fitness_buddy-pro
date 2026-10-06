import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Play,
  Sparkles,
  Trophy,
  Utensils,
} from "lucide-react";
import { Button, Card, Badge } from "../components/ui";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-teal-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/20 to-cyan-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] bg-teal-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-cyan-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Modern SaaS Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-teal-500/20 transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Fitness<span className="text-teal-400">Buddy</span>
              </span>
              <span className="ml-1 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                PRO
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-teal-400 transition-colors">
              How It Works
            </a>
            <a href="#preview" className="hover:text-teal-400 transition-colors">
              Product Tour
            </a>
            <a href="#ai-assistant" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              AI Assistant
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" iconRight={ArrowRight}>
                Start Training
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-300 mb-8 backdrop-blur-md animate-in fade-in duration-700">
          <Badge variant="teal" size="sm">New</Badge>
          <span>AI-Assisted Personal Fitness Architecture 2.0</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Build Your Stronger Self With{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Smart Fitness Tracking
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          The engineering-grade health and performance platform. Plan structured routines, log progressive overload, analyze macronutrients, and unlock data-driven insights with our evidence-backed AI assistant.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto text-base" iconRight={ArrowRight}>
              Start Training Free
            </Button>
          </Link>
          <a href="#preview" className="w-full sm:w-auto">
            <Button variant="glass" size="lg" className="w-full sm:w-auto text-base" icon={Play}>
              Explore Features
            </Button>
          </a>
        </div>

        {/* Live Social Proof Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-white/10">
          <div>
            <p className="text-3xl font-extrabold text-white">99.4%</p>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">Log Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-teal-400">120+ </p>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">Exercise Library</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">ACSM</p>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">MET Science Calorie Engine</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-cyan-400">0ms</p>
            <p className="text-xs uppercase tracking-wider text-slate-400 mt-1 font-medium">Offline PWA Sync</p>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW / MOCKUP */}
      <section id="preview" className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-28">
        <div className="relative rounded-3xl border border-white/15 bg-slate-900/80 p-2 sm:p-4 shadow-2xl shadow-teal-500/10 backdrop-blur-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/60 rounded-2xl mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">app.fitnessbuddypro.io/dashboard</span>
            </div>
            <Badge variant="teal" size="sm">Live Telemetry Preview</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 sm:p-4">
            {/* Metric Card 1 */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Caloric Balance</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-3xl font-black text-white">2,140 <span className="text-sm font-normal text-slate-400">/ 2,400 kcal</span></p>
              <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full w-[89%]" />
              </div>
              <p className="text-xs text-emerald-400 mt-2 font-medium">89% of target reached</p>
            </div>

            {/* Metric Card 2 */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Session Volume</span>
                <Activity className="w-4 h-4 text-teal-400" />
              </div>
              <p className="text-3xl font-black text-white">14,820 <span className="text-sm font-normal text-slate-400">kg total</span></p>
              <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full w-[100%]" />
              </div>
              <p className="text-xs text-teal-300 mt-2 font-medium">+8.4% progressive overload</p>
            </div>

            {/* Metric Card 3 */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider">Habit Consistency</span>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-3xl font-black text-white">18 <span className="text-sm font-normal text-slate-400">day streak</span></p>
              <div className="w-full bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full w-[95%]" />
              </div>
              <p className="text-xs text-emerald-300 mt-2 font-medium">Top 5% consistency rank</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="teal" size="sm" className="mb-4">Complete Suite</Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Engineered for Serious Lifters and Athletes
          </h2>
          <p className="text-slate-400 text-base">
            No bloated social noise. Every feature is tuned for maximal metabolic adherence and progressive performance tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card glow>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Workout Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log sets, target reps, RPE, load, and rest times. Real-time ACSM MET formula computes precise caloric burn based on body mass.
            </p>
          </Card>

          <Card glow>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Progress Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track weight changes, body fat, muscle circumference, and 30-day rolling consistency scores with interactive telemetry charts.
            </p>
          </Card>

          <Card glow>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Nutrition Monitoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track macros (protein, carbohydrates, dietary fats, fiber) and hydration levels against Mifflin-St Jeor metabolic expenditure targets.
            </p>
          </Card>

          <Card glow>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personalized Plans</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate custom 8-to-12 week training cycles for hypertrophy, fat loss, or strength with automated volume progression.
            </p>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" size="sm" className="mb-4">The Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Four Steps to Long-Term Transformation
          </h2>
          <p className="text-slate-400 text-base">
            Systematic execution replaces guesswork with sustainable physical progress.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative p-6 rounded-3xl bg-slate-900/50 border border-white/10">
            <span className="text-4xl font-black text-teal-500/40 font-mono">01</span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Set Your Goal</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define target weight, deadline dates, and daily calorie/protein benchmarks with automated BMR calculation.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-slate-900/50 border border-white/10">
            <span className="text-4xl font-black text-teal-500/40 font-mono">02</span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Follow Your Plan</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select verified exercise routines from our comprehensive library, or let the AI assistant architect a balanced split.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-slate-900/50 border border-white/10">
            <span className="text-4xl font-black text-teal-500/40 font-mono">03</span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Track Progress</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log daily workouts, nutrition intake, water consumption, and body measurements in under two minutes per day.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-slate-900/50 border border-white/10">
            <span className="text-4xl font-black text-teal-500/40 font-mono">04</span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Achieve Results</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyze trends on weekly reports, maintain unbroken habit streaks, and hit your milestones sustainably.
            </p>
          </div>
        </div>
      </section>

      {/* AI ASSISTANT SHOWCASE */}
      <section id="ai-assistant" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="purple" size="sm" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Intelligent Coaching
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-6">
              AI Fitness Assistant Built on Evidence, Not Fads
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Our assistant analyzes your training history to recommend optimal volume, macro distribution, and recovery protocols. Equipped with built-in medical safety guardrails to ensure healthy progress.
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Personalized macro distribution (Protein, Carbs, Fats)</span>
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Form cues & mechanical optimization for major compound lifts</span>
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Pre-workout meal recommendations & hydration pacing</span>
              </li>
              <li className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Rigorous safety filters preventing dangerous physical advice</span>
              </li>
            </ul>

            <Link to="/register">
              <Button variant="primary" size="md" iconRight={ArrowRight}>
                Try AI Assistant
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">FitnessBuddy AI Coach</p>
                <p className="text-xs text-emerald-400">Active • Evidence-Based Engine</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/60 p-3.5 rounded-2xl rounded-tl-sm border border-white/5 text-slate-300">
                "Based on your current goal of lean muscle gain, you should target approximately 144g of protein daily. Prioritize 30-40g post-workout along with 50g of complex carbs."
              </div>
              <div className="bg-teal-500/10 p-3.5 rounded-2xl rounded-tr-sm border border-teal-500/20 text-teal-200 ml-auto max-w-[85%]">
                "What's the best warm-up routine for heavy barbell squats?"
              </div>
              <div className="bg-slate-800/60 p-3.5 rounded-2xl rounded-tl-sm border border-white/5 text-slate-300">
                "Perform 5 minutes of low-intensity cycling, followed by 90/90 hip mobility, bodyweight goblet squats with a 3-second pause, and progressive bar warm-up sets."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-teal-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 p-10 sm:p-16 text-center shadow-2xl shadow-teal-500/10">
          <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl" />
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Ready to Take Control of Your Fitness?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-base">
            Join thousands of lifters tracking workouts, managing nutrition, and smashing goals with Fitness Buddy Pro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" iconRight={ArrowRight}>
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Existing Member Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-teal-400" />
          <span className="text-slate-300 font-bold">Fitness Buddy Pro</span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-slate-300 transition-colors">Workflow</a>
          <Link to="/login" className="hover:text-slate-300 transition-colors">Login</Link>
          <Link to="/register" className="hover:text-slate-300 transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
