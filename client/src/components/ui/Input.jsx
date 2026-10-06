import React from "react";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helper,
      icon: Icon,
      iconRight: IconRight,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border ${
              error
                ? "border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20"
                : "border-white/10 bg-slate-900/80 hover:border-white/20 focus:border-teal-400 focus:ring-teal-400/20"
            } py-2.5 ${
              Icon ? "pl-10" : "pl-3.5"
            } ${IconRight ? "pr-10" : "pr-3.5"} text-sm text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${className}`}
            {...props}
          />

          {IconRight && (
            <div className="absolute right-3.5 flex items-center text-slate-400">
              <IconRight className="w-4 h-4" />
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        {!error && helper && <p className="text-xs text-slate-400">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
