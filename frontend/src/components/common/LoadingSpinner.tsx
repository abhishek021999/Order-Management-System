import React from "react";

interface Props { size?: "sm" | "md" | "lg"; fullscreen?: boolean; text?: string; }

const SIZE = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };

const LoadingSpinner: React.FC<Props> = ({ size = "md", fullscreen = false, text }) => {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${SIZE[size]} rounded-full border-2 border-slate-200 border-t-brand-600 animate-spin-slow`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
