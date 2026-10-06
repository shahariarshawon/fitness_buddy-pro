export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon: Icon,
  ...props
}) => {
  const variants = {
    default: "bg-slate-800 text-slate-300 border border-slate-700/60",
    teal: "bg-teal-500/10 text-teal-300 border border-teal-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
    purple: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    red: "bg-red-500/10 text-red-300 border border-red-500/20",
    outline: "bg-transparent text-slate-300 border border-white/10",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 font-medium rounded-full gap-1",
    md: "text-xs px-2.5 py-1 font-semibold rounded-full gap-1.5",
    lg: "text-sm px-3.5 py-1.5 font-semibold rounded-xl gap-2",
  };

  return (
    <span
      className={`inline-flex items-center tracking-wide uppercase ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
