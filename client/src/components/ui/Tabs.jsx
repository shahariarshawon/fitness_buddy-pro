export const Tabs = ({ tabs, activeTab, onChange, className = "" }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30 shadow-md shadow-teal-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? "bg-teal-500/30 text-teal-200"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
