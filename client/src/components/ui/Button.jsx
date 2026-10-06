import React from "react";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      disabled = false,
      loading = false,
      icon: Icon,
      iconRight: IconRight,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variants = {
      primary:
        "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 focus:ring-teal-400",
      secondary:
        "bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-slate-700/60 hover:border-slate-600 focus:ring-slate-500 shadow-sm",
      outline:
        "bg-transparent hover:bg-slate-800/50 text-slate-200 border border-slate-700 hover:border-teal-400/50 hover:text-teal-300 focus:ring-teal-400",
      ghost:
        "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white focus:ring-slate-500",
      danger:
        "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 focus:ring-red-400",
      glass:
        "bg-white/[0.06] hover:bg-white/[0.12] text-white backdrop-blur-md border border-white/10 hover:border-white/20 focus:ring-white/30",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${
          sizes[size] || sizes.md
        } ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!loading && Icon && <Icon className="w-4 h-4 shrink-0" />}
        {children}
        {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
