export const Card = ({
  children,
  className = "",
  glass = true,
  glow = false,
  hover = true,
  ...props
}) => {
  return (
    <div
      className={`relative rounded-3xl border border-white/10 ${
        glass ? "bg-slate-900/60 backdrop-blur-xl" : "bg-slate-900"
      } p-6 shadow-xl shadow-black/20 ${
        hover
          ? "transition-all duration-300 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/5 hover:-translate-y-0.5"
          : ""
      } ${className}`}
      {...props}
    >
      {glow && (
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-teal-500/10 blur-3xl" />
      )}
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-5 flex items-start justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-bold tracking-tight text-white ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "", ...props }) => (
  <p className={`text-xs text-slate-400 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "", ...props }) => (
  <div className={`relative ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`mt-5 pt-4 border-t border-white/5 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
