import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Compass } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 animate-slide-up">
      {/* Large 404 */}
      <div className="relative mb-8 select-none">
        <p className="text-[120px] sm:text-[160px] font-black leading-none text-slate-100 tracking-tighter">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand-lg">
            <Compass size={36} className="text-white" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page not found
      </h1>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary gap-2">
          <ArrowLeft size={15} /> Go back
        </button>
        <button onClick={() => navigate("/")} className="btn-primary gap-2">
          <Home size={15} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
