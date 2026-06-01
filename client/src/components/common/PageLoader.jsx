const PageLoader = ({
  title = "Loading Fitness Buddy Pro",
  message = "Preparing your fitness dashboard...",
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <style>
        {`
          @keyframes loadingBar {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(0); }
          }

          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .fade-slide-up { animation: fadeSlideUp 0.5s ease-out forwards; }
        `}
      </style>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md fade-slide-up">
        {/* Floating gradient orbs */}
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-tr from-[#009587]/30 to-[#00809d]/20 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-br from-[#7f265b]/20 to-[#00809d]/10 blur-3xl animate-pulse-slow" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="relative mb-6">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-[#009587]/20 to-[#00809d]/30 flex items-center justify-center">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#009587] to-[#00809d] flex items-center justify-center shadow-lg shadow-[#009587]/40">
                <span className="text-2xl font-black text-white">FB</span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-[#009587]/40 animate-ping-slow" />
          </div>

          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{message}</p>

          {/* Animated loading bar */}
          <div className="mt-8 w-full">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 relative">
              <div
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#009587] to-[#00809d]"
                style={{ animation: "loadingBar 1.4s ease-in-out infinite" }}
              />
            </div>

            {/* Animated bouncing dots */}
            <div className="mt-4 flex justify-center gap-2">
              {[0, 0.15, 0.3].map((delay, idx) => (
                <span
                  key={idx}
                  className="h-2 w-2 rounded-full bg-gradient-to-r from-[#009587] to-[#00809d] animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500 tracking-wide">
            Workout • Diet • Habits • Progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;