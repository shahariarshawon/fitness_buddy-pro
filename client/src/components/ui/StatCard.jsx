export const StatCard = ({
  title,
  value,
  suffix,
  helper,
  icon: Icon,
  progress,
  trend,
  className = "",
}) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-500/30 hover:bg-slate-900/80 ${className}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal-500/10 blur-2xl transition group-hover:bg-teal-500/20" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>

        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 text-teal-300 ring-1 ring-white/10 group-hover:ring-teal-400/30 transition-all">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {value}
          </h2>
          {suffix && (
            <span className="text-xs font-medium text-slate-400">{suffix}</span>
          )}
          {trend !== undefined && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                trend >= 0
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-red-400 bg-red-500/10"
              }`}
            >
              {trend >= 0 ? `+${trend}` : trend}%
            </span>
          )}
        </div>

        {progress !== undefined && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
              <span>Goal Progress</span>
              <span className="font-semibold text-teal-300">
                {Math.min(Number(progress || 0), 100)}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
                style={{
                  width: `${Math.min(Number(progress || 0), 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
