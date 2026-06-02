import { Activity, Dumbbell, HeartPulse, Sparkles } from "lucide-react";

const PageLoader = ({
  title = "Loading Fitness Buddy Pro",
  message = "Preparing your fitness dashboard...",
}) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#031113] px-4 text-white">
      <style>
        {`
          @keyframes floatOrb {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.65;
            }
            50% {
              transform: translate3d(16px, -18px, 0) scale(1.08);
              opacity: 1;
            }
          }

          @keyframes pulseRing {
            0% {
              transform: scale(0.9);
              opacity: 0.8;
            }
            70% {
              transform: scale(1.35);
              opacity: 0;
            }
            100% {
              transform: scale(1.35);
              opacity: 0;
            }
          }

          @keyframes rotateGlow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes loadingBar {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(20%);
            }
            100% {
              transform: translateX(130%);
            }
          }

          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(18px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes breathe {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 30px rgba(0, 149, 135, 0.25);
            }
            50% {
              transform: scale(1.04);
              box-shadow: 0 0 55px rgba(0, 149, 135, 0.42);
            }
          }

          @keyframes dotWave {
            0%, 80%, 100% {
              transform: translateY(0);
              opacity: 0.45;
            }
            40% {
              transform: translateY(-8px);
              opacity: 1;
            }
          }

          @keyframes iconFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-7px);
            }
          }

          .loader-card {
            animation: fadeSlideUp 0.55s ease-out forwards;
          }

          .float-orb-one {
            animation: floatOrb 5s ease-in-out infinite;
          }

          .float-orb-two {
            animation: floatOrb 6.5s ease-in-out infinite reverse;
          }

          .float-orb-three {
            animation: floatOrb 7.5s ease-in-out infinite;
          }

          .breathe-logo {
            animation: breathe 2.4s ease-in-out infinite;
          }

          .rotate-glow {
            animation: rotateGlow 5s linear infinite;
          }

          .pulse-ring-one {
            animation: pulseRing 1.8s ease-out infinite;
          }

          .pulse-ring-two {
            animation: pulseRing 1.8s ease-out infinite;
            animation-delay: 0.45s;
          }

          .dot-wave {
            animation: dotWave 1.1s ease-in-out infinite;
          }

          .icon-float {
            animation: iconFloat 2.2s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background glow */}
      <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-[#009587]/20 blur-3xl float-orb-one" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-[#00809d]/20 blur-3xl float-orb-two" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00c2ad]/10 blur-3xl float-orb-three" />

      {/* Small floating icons */}
      <div className="pointer-events-none absolute left-[12%] top-[18%] hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-[#9ff7ec] backdrop-blur-xl icon-float md:block">
        <Dumbbell size={22} />
      </div>

      <div
        className="pointer-events-none absolute right-[14%] top-[24%] hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-[#9ff7ec] backdrop-blur-xl icon-float md:block"
        style={{ animationDelay: "0.35s" }}
      >
        <HeartPulse size={22} />
      </div>

      <div
        className="pointer-events-none absolute bottom-[18%] right-[18%] hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-[#9ff7ec] backdrop-blur-xl icon-float md:block"
        style={{ animationDelay: "0.75s" }}
      >
        <Activity size={22} />
      </div>

      {/* Main card */}
      <div className="loader-card relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#009587]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#00809d]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo animation */}
          <div className="relative mb-7 flex h-28 w-28 items-center justify-center">
            <div className="pulse-ring-one absolute inset-0 rounded-[2rem] border border-[#00c2ad]/40" />
            <div className="pulse-ring-two absolute inset-0 rounded-[2rem] border border-[#009587]/40" />

            <div className="rotate-glow absolute inset-0 rounded-[2rem] bg-gradient-to-r from-[#009587] via-[#00c2ad] to-[#00809d] opacity-40 blur-sm" />

            <div className="breathe-logo relative flex h-24 w-24 items-center justify-center rounded-[1.7rem] border border-white/10 bg-[#06191d] shadow-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#009587] to-[#00809d] shadow-lg shadow-[#009587]/35">
                <span className="text-2xl font-black tracking-tight text-white">
                  FB
                </span>
              </div>
            </div>

            <div className="absolute -right-2 -top-2 rounded-full bg-[#00c2ad] p-2 text-[#031113] shadow-lg shadow-[#00c2ad]/30">
              <Sparkles size={15} />
            </div>
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#009587]/20 bg-[#009587]/10 px-4 py-1.5 text-xs font-semibold text-[#9ff7ec]">
            <span className="h-2 w-2 rounded-full bg-[#00c2ad]" />
            Fitness Buddy Pro
          </div>

          <h1 className="bg-gradient-to-r from-white via-[#9ff7ec] to-[#00c2ad] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            {title}
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
            {message}
          </p>

          {/* Loading bar */}
          <div className="mt-8 w-full">
            <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.06]">
              <div
                className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-[#009587] via-[#00c2ad] to-[#00809d] shadow-lg shadow-[#009587]/30"
                style={{ animation: "loadingBar 1.45s ease-in-out infinite" }}
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {[0, 0.14, 0.28].map((delay, index) => (
                <span
                  key={index}
                  className="dot-wave h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#009587] to-[#00c2ad]"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>

          {/* Bottom feature pills */}
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {["Workout", "Diet", "Habits", "Progress"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-400"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;