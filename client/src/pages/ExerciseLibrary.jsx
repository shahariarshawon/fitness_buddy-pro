import { useEffect, useState, useMemo } from "react";
import {
  Dumbbell,
  Search,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";
import { Button, Badge, Input, Modal } from "../components/ui";

const categories = [
  { id: "all", label: "All Categories" },
  { id: "strength", label: "Strength" },
  { id: "cardio", label: "Cardio" },
  { id: "bodyweight", label: "Bodyweight" },
  { id: "mobility", label: "Mobility" },
];

const muscleGroups = [
  { id: "all", label: "All Muscles" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "legs", label: "Legs" },
  { id: "arms", label: "Arms" },
  { id: "core", label: "Core" },
  { id: "full_body", label: "Full Body" },
];

const fallbackExercises = [
  {
    _id: "ex_1",
    name: "Barbell Bench Press",
    category: "strength",
    muscleGroup: "chest",
    secondaryMuscles: ["shoulders", "triceps"],
    equipment: "Barbell, Flat Bench",
    difficulty: "intermediate",
    metValue: 5.0,
    instructions:
      "Lie flat on the bench with eyes under the bar. Grip bar slightly wider than shoulder-width. Lower bar with controlled cadence to mid-chest. Drive feet into the ground and press up explosively.",
    tips: "Keep shoulder blades retracted and maintain a neutral lumbar arch.",
  },
  {
    _id: "ex_2",
    name: "Barbell Back Squat",
    category: "strength",
    muscleGroup: "legs",
    secondaryMuscles: ["glutes", "core"],
    equipment: "Barbell, Squat Rack",
    difficulty: "intermediate",
    metValue: 6.0,
    instructions:
      "Position bar across upper trapezius. Unrack and take two paces back. Inhale and brace abdomen. Break at hips and knees simultaneously until hip crease is below knee level. Drive through midfoot.",
    tips: "Never let knees cave inward during the concentric drive.",
  },
  {
    _id: "ex_3",
    name: "Conventional Deadlift",
    category: "strength",
    muscleGroup: "back",
    secondaryMuscles: ["hamstrings", "glutes", "forearms"],
    equipment: "Barbell, Olympic Plates",
    difficulty: "advanced",
    metValue: 6.5,
    instructions:
      "Stand with feet hip-width apart, bar over mid-foot. Hinge down and take double-overhand or mixed grip. Pull slack out of the bar, brace lats, and drive the floor away until standing tall.",
    tips: "Do not hyperextend the lower spine at the top lockout.",
  },
  {
    _id: "ex_4",
    name: "Pull-Ups",
    category: "bodyweight",
    muscleGroup: "back",
    secondaryMuscles: ["biceps", "core"],
    equipment: "Pull-Up Bar",
    difficulty: "intermediate",
    metValue: 5.0,
    instructions:
      "Grip overhead bar slightly outside shoulder width. Initiate by pulling scapulae down and together. Drive elbows towards your ribs until chin clears the bar. Lower with full control.",
    tips: "Avoid swinging or kipping to maintain strict lat recruitment.",
  },
  {
    _id: "ex_5",
    name: "Standing Dumbbell Overhead Press",
    category: "strength",
    muscleGroup: "shoulders",
    secondaryMuscles: ["triceps", "upper chest"],
    equipment: "Dumbbells",
    difficulty: "intermediate",
    metValue: 4.5,
    instructions:
      "Stand tall with feet shoulder-width apart. Hold dumbbells at shoulder height with palms forward. Press overhead until arms lock out gently. Lower with 2-second control.",
    tips: "Engage glutes and core to avoid backward arching.",
  },
  {
    _id: "ex_6",
    name: "Romanian Deadlift (RDL)",
    category: "strength",
    muscleGroup: "legs",
    secondaryMuscles: ["hamstrings", "glutes", "erectors"],
    equipment: "Barbell or Dumbbells",
    difficulty: "intermediate",
    metValue: 5.0,
    instructions:
      "Start standing tall. Soften knees slightly and push hips backward as far as possible while keeping the bar in contact with your thighs. Feel a deep hamstring stretch, then drive hips forward.",
    tips: "Keep back flat as a tabletop throughout.",
  },
  {
    _id: "ex_7",
    name: "Hanging Leg Raises",
    category: "bodyweight",
    muscleGroup: "core",
    secondaryMuscles: ["hip flexors"],
    equipment: "Pull-Up Bar",
    difficulty: "advanced",
    metValue: 4.0,
    instructions:
      "Hang from a bar with palms facing forward. Without swinging, curl your pelvis upward and lift your legs until parallel or higher. Lower slowly under full eccentric control.",
    tips: "Focus on curling the pelvis, not just flexing at the hips.",
  },
  {
    _id: "ex_8",
    name: "Incline Treadmill Power Walk",
    category: "cardio",
    muscleGroup: "legs",
    secondaryMuscles: ["calves", "cardiovascular"],
    equipment: "Treadmill",
    difficulty: "beginner",
    metValue: 5.5,
    instructions:
      "Set incline between 10% to 15% and speed to 4.5-5.5 km/h. Maintain upright posture with natural arm swing. Avoid holding onto handrails for maximum metabolic rate.",
    tips: "Excellent low-impact Zone 2 cardiovascular training.",
  },
];

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMuscle, setSelectedMuscle] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchExercises = async () => {
      try {
        const res = await api.get("/exercises");
        if (!isMounted) return;
        if (res.data?.exercises?.length > 0) {
          setExercises(res.data.exercises);
        } else if (res.data?.data?.length > 0) {
          setExercises(res.data.data);
        } else {
          setExercises(fallbackExercises);
        }
      } catch {
        if (isMounted) setExercises(fallbackExercises);
      }
    };

    fetchExercises();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || ex.category === selectedCategory;

      const matchesMuscle =
        selectedMuscle === "all" || ex.muscleGroup === selectedMuscle;

      return matchesSearch && matchesCategory && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedCategory, selectedMuscle]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Exercise Library
            </h1>
            <Badge variant="teal" size="sm">
              {filteredExercises.length} Movements
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search biomechanical instructions, target muscle groups, and MET expenditure values.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Input
            placeholder="Search exercises by name or muscle..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
          >
            {muscleGroups.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise._id}
            onClick={() => setSelectedExercise(exercise)}
            className="group relative rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl hover:border-teal-500/40 hover:bg-slate-900/90 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <Badge variant={exercise.category === "cardio" ? "amber" : "teal"} size="sm">
                  {exercise.category}
                </Badge>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded bg-white/5">
                  MET {exercise.metValue || 4.5}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                {exercise.name}
              </h3>

              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="capitalize text-slate-300 font-medium">
                  {exercise.muscleGroup}
                </span>
                <span>•</span>
                <span className="text-slate-400 capitalize">
                  {exercise.difficulty || "All Levels"}
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {exercise.instructions || "Click to view full biomechanical instruction and execution notes."}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-teal-400">
              <span>View Guide</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-white/5">
          <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No exercises found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <Modal
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name}
        description={`${selectedExercise?.category?.toUpperCase()} • TARGET: ${selectedExercise?.muscleGroup?.toUpperCase()}`}
      >
        {selectedExercise && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Equipment</span>
                <span className="text-white font-medium">{selectedExercise.equipment || "Standard Gym Equipment"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">MET Value</span>
                <span className="text-teal-300 font-medium">{selectedExercise.metValue || 4.5} (Calorie Multiplier)</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                Execution Instructions
              </h4>
              <p className="leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                {selectedExercise.instructions}
              </p>
            </div>

            {selectedExercise.tips && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
                  Pro Coaching Cues
                </h4>
                <p className="leading-relaxed bg-teal-500/10 p-3.5 rounded-xl border border-teal-500/20 text-teal-200">
                  {selectedExercise.tips}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedExercise(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;
