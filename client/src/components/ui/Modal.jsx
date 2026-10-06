import { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
  showClose = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all animate-in zoom-in-95 duration-200 z-10`}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            {title && (
              <h2 className="text-xl font-bold tracking-tight text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            )}
          </div>

          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
