const PageLoader = ({
  title = "Loading Fitness Buddy Pro",
  message = "Preparing your fitness dashboard...",
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="h-20 w-20 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-xl font-black text-white">FB</span>
              </div>
            </div>

            <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/40 animate-ping" />
          </div>

          <h1 className="text-2xl font-bold text-white">{title}</h1>

          <p className="mt-2 text-sm text-slate-400">{message}</p>

          <div className="mt-8 w-full">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 rounded-full bg-orange-500 animate-[loadingBar_1.4s_ease-in-out_infinite]" />
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.15s]" />
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Workout • Diet • Habits • Progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;