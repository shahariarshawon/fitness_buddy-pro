import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import api from "../services/api";
import { Button, Card, Badge, Input, Modal } from "../components/ui";

const defaultMockGoals = [
  {
    _id: "g1",
    title: "Lose 6kg for Summer Conditioning",
    type: "weight_loss",
    startValue: 86,
    currentValue: 82.5,
    targetValue: 80,
    unit: "kg",
    targetDate: "2026-12-31T00:00:00.000Z",
    priority: "high",
    status: "in_progress",
    milestones: [
      { _id: "m1", title: "Break through 84kg plateau", completed: true },
      { _id: "m2", title: "Consistently track macros 21 days straight", completed: true },
      { _id: "m3", title: "Reach 80kg target weight", completed: false },
    ],
  },
  {
    _id: "g2",
    title: "Hit 100kg Bench Press 1RM",
    type: "strength",
    startValue: 80,
    currentValue: 92.5,
    targetValue: 100,
    unit: "kg",
    targetDate: "2026-11-30T00:00:00.000Z",
    priority: "high",
    status: "in_progress",
    milestones: [
      { _id: "m4", title: "Hit 85kg for 5x5", completed: true },
      { _id: "m5", title: "Hit 92.5kg for 3 reps", completed: true },
      { _id: "m6", title: "Attempt 100kg single", completed: false },
    ],
  },
  {
    _id: "g3",
    title: "Maintain 30-Day Consistent Daily Habit Streak",
    type: "habit_streak",
    startValue: 0,
    currentValue: 18,
    targetValue: 30,
    unit: "days",
    targetDate: "2026-10-31T00:00:00.000Z",
    priority: "medium",
    status: "in_progress",
    milestones: [
      { _id: "m7", title: "Reach 7-day streak", completed: true },
      { _id: "m8", title: "Reach 14-day streak", completed: true },
      { _id: "m9", title: "Hit complete 30-day streak", completed: false },
    ],
  },
];

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "weight_loss",
    startValue: "",
    currentValue: "",
    targetValue: "",
    unit: "kg",
    targetDate: "",
    priority: "medium",
    notes: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchGoals = async () => {
      try {
        const res = await api.get("/v1/goals");
        if (!isMounted) return;
        if (res.data?.data && res.data.data.length > 0) {
          setGoals(res.data.data);
        } else {
          setGoals(defaultMockGoals);
        }
      } catch {
        if (isMounted) setGoals(defaultMockGoals);
      }
    };

    fetchGoals();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const newGoal = {
        title: formData.title,
        type: formData.type,
        startValue: Number(formData.startValue) || 0,
        currentValue: Number(formData.currentValue) || Number(formData.startValue) || 0,
        targetValue: Number(formData.targetValue),
        unit: formData.unit,
        targetDate: formData.targetDate,
        priority: formData.priority,
        notes: formData.notes,
        milestones: [
          { title: "Initial baseline achieved", completed: true },
          { title: "Halfway milestone", completed: false },
          { title: "Final target reached", completed: false },
        ],
      };

      try {
        const res = await api.post("/v1/goals", newGoal);
        if (res.data?.data) {
          setGoals([res.data.data, ...goals]);
        } else {
          setGoals([{ ...newGoal, _id: "goal_" + Math.random().toString(36).substr(2, 9) }, ...goals]);
        }
      } catch {
        setGoals([{ ...newGoal, _id: "goal_" + Math.random().toString(36).substr(2, 9) }, ...goals]);
      }

      setIsModalOpen(false);
      setFormData({
        title: "",
        type: "weight_loss",
        startValue: "",
        currentValue: "",
        targetValue: "",
        unit: "kg",
        targetDate: "",
        priority: "medium",
        notes: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (goalId, milestoneId) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g._id !== goalId) return g;
        return {
          ...g,
          milestones: g.milestones.map((m) =>
            m._id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        };
      })
    );

    try {
      await api.patch(`/v1/goals/${goalId}/milestones/${milestoneId}`);
    } catch {
      // Handled optimistically
    }
  };

  const calculateProgress = (goal) => {
    const start = Number(goal.startValue || 0);
    const target = Number(goal.targetValue || 0);
    const current = Number(goal.currentValue || 0);

    if (start === target) return 100;
    const totalChangeNeeded = Math.abs(target - start);
    if (totalChangeNeeded === 0) return 0;
    const currentChange = Math.abs(current - start);
    const percent = Math.round((currentChange / totalChangeNeeded) * 100);
    return Math.min(Math.max(percent, 0), 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Target Goals & Milestones
            </h1>
            <Badge variant="teal" size="sm">
              {goals.length} Active Targets
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Define quantifiable fitness targets, break them into milestones, and track real-time completion.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Create Goal
        </Button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);

          return (
            <Card key={goal._id} glow className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge
                    variant={
                      goal.priority === "high"
                        ? "red"
                        : goal.priority === "medium"
                        ? "teal"
                        : "default"
                    }
                    size="sm"
                  >
                    {goal.priority} priority
                  </Badge>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {goal.title}
                </h3>

                <div className="flex items-baseline justify-between text-xs text-slate-400 mb-3">
                  <span>
                    Current: <strong className="text-white">{goal.currentValue} {goal.unit}</strong>
                  </span>
                  <span>
                    Target: <strong className="text-teal-400">{goal.targetValue} {goal.unit}</strong>
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Progress</span>
                    <span className="font-bold text-teal-300">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Milestones Checklist
                    </span>
                    {goal.milestones.map((m) => (
                      <div
                        key={m._id}
                        onClick={() => handleToggleMilestone(goal._id, m._id)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          m.completed
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-200"
                            : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            m.completed ? "text-teal-400" : "text-slate-600"
                          }`}
                        />
                        <span className={m.completed ? "line-through text-slate-400" : "font-medium"}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Fitness Goal"
        description="Set quantifiable milestones and a completion deadline"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Cut from 85kg to 78kg"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Goal Category
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-900 py-2.5 px-3 text-xs text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="strength">Strength Record</option>
                <option value="habit_streak">Habit Streak</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-slate-900 py-2.5 px-3 text-xs text-white"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Start Value"
              type="number"
              placeholder="e.g. 85"
              value={formData.startValue}
              onChange={(e) => setFormData({ ...formData, startValue: e.target.value })}
            />
            <Input
              label="Target Value"
              type="number"
              placeholder="e.g. 78"
              required
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
            />
            <Input
              label="Unit"
              placeholder="kg, lbs, days"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <Input
            label="Target Deadline"
            type="date"
            required
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
          />

          <div className="pt-3 flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;
