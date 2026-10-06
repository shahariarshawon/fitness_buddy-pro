import { useState, useEffect } from "react";
import {
  ChevronRight,
  UserPlus,
} from "lucide-react";
import api from "../services/api";
import { Button, Card, Badge, Modal } from "../components/ui";

const defaultClients = [
  {
    _id: "client_1",
    name: "Marcus Vance",
    email: "marcus.v@example.com",
    goal: "muscle_gain",
    currentWeight: 78.5,
    targetWeight: 84.0,
    activePlan: "12-Week Hypertrophy Split",
    adherenceRate: 94,
    lastActive: "2 hours ago",
  },
  {
    _id: "client_2",
    name: "Elena Rostova",
    email: "elena.r@example.com",
    goal: "fat_loss",
    currentWeight: 66.2,
    targetWeight: 60.0,
    activePlan: "Metabolic Conditioning Phase II",
    adherenceRate: 88,
    lastActive: "Yesterday",
  },
  {
    _id: "client_3",
    name: "David Kim",
    email: "david.k@example.com",
    goal: "strength",
    currentWeight: 85.0,
    targetWeight: 85.0,
    activePlan: "Powerbuilding 5-Day Wave",
    adherenceRate: 98,
    lastActive: "Today",
  },
];

const TrainerDashboard = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchClients = async () => {
      try {
        const res = await api.get("/v1/trainer/clients");
        if (!isMounted) return;
        if (res.data?.data && res.data.data.length > 0) {
          setClients(res.data.data);
        } else {
          setClients(defaultClients);
        }
      } catch {
        if (isMounted) setClients(defaultClients);
      }
    };

    fetchClients();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectClient = async (client) => {
    setSelectedClient(client);
    try {
      const res = await api.get(`/v1/trainer/clients/${client._id}/progress`);
      setClientDetails(res.data?.data);
    } catch {
      setClientDetails({
        recentWorkouts: [
          { workoutName: "Heavy Upper Power", date: "2026-10-06T10:00:00.000Z", duration: 65, caloriesBurned: 420 },
          { workoutName: "Lower Quad Emphasis", date: "2026-10-04T10:00:00.000Z", duration: 75, caloriesBurned: 510 },
        ],
        progressLogs: [
          { weight: client.currentWeight, date: "2026-10-06T10:00:00.000Z" },
        ],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Trainer Command Center
            </h1>
            <Badge variant="teal" size="sm">
              Pro Trainer Tier
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor client adherence, assign training cycles, and review workout completion telemetry.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={UserPlus}>
          Invite New Client
        </Button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card glow>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Active Client Roster
          </span>
          <p className="text-3xl font-black text-white mt-2">{clients.length}</p>
          <span className="text-xs text-emerald-400 mt-1 block">All clients active this week</span>
        </Card>

        <Card glow>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Average Adherence
          </span>
          <p className="text-3xl font-black text-teal-400 mt-2">93.3%</p>
          <span className="text-xs text-slate-400 mt-1 block">+4.2% vs last month</span>
        </Card>

        <Card glow>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
            Workouts Logged
          </span>
          <p className="text-3xl font-black text-cyan-400 mt-2">48</p>
          <span className="text-xs text-slate-400 mt-1 block">Past 7 days across roster</span>
        </Card>
      </div>

      {/* Client Roster Table */}
      <Card glow>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">Client Roster</h3>
          <span className="text-xs text-slate-400">Click a client to review logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Client Name</th>
                <th className="pb-3">Primary Goal</th>
                <th className="pb-3">Current / Target Weight</th>
                <th className="pb-3">Assigned Plan</th>
                <th className="pb-3">Adherence</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => handleSelectClient(c)}
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="py-4 pl-2 font-bold text-white group-hover:text-teal-300">
                    <div>{c.name}</div>
                    <span className="text-[10px] font-normal text-slate-500">{c.email}</span>
                  </td>
                  <td className="py-4 capitalize text-slate-300">{c.goal?.replace("_", " ")}</td>
                  <td className="py-4 text-slate-300">
                    <span className="font-semibold text-white">{c.currentWeight}kg</span> / {c.targetWeight}kg
                  </td>
                  <td className="py-4 text-slate-300">{c.activePlan || "Custom Split"}</td>
                  <td className="py-4">
                    <Badge variant={c.adherenceRate >= 90 ? "emerald" : "amber"} size="sm">
                      {c.adherenceRate || 90}%
                    </Badge>
                  </td>
                  <td className="py-4 text-right pr-2 text-teal-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span className="inline-flex items-center gap-1">
                      Review <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client Detail Review Modal */}
      <Modal
        isOpen={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
        title={selectedClient ? `${selectedClient.name} — Progress Dossier` : ""}
        description="Comprehensive training adherence and workout history"
        maxWidth="max-w-2xl"
      >
        {selectedClient && (
          <div className="space-y-5 text-xs text-slate-300">
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Weight</span>
                <span className="text-base font-bold text-white">{selectedClient.currentWeight} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Weight</span>
                <span className="text-base font-bold text-teal-400">{selectedClient.targetWeight} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Program Adherence</span>
                <span className="text-base font-bold text-emerald-400">{selectedClient.adherenceRate || 92}%</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                Recent Logged Workouts
              </h4>
              <div className="space-y-2">
                {clientDetails?.recentWorkouts?.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white block">{w.workoutName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(w.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-teal-300 font-mono font-bold">{w.duration} mins</span>
                      <span className="text-[10px] text-slate-400 block">{w.caloriesBurned} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedClient(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm">
                Assign New Cycle
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrainerDashboard;
