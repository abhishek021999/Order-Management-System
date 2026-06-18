import React from "react";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: string; up: boolean };
  gradient?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<Props> = ({ title, value, subtitle, icon, iconBg, trend, gradient, onClick }) => (
  <div
    className={`stat-card group ${gradient ?? ""} ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-card-md" : ""}`}
    onClick={onClick}
  >
    <div className={`stat-icon ${iconBg} shadow-inner-sm`}>{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{title}</p>
      <p className="text-[1.6rem] font-extrabold text-slate-900 mt-0.5 leading-none tracking-tight">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1 leading-none">{subtitle}</p>}
      {trend && (
        <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-0.5 rounded-full
          ${trend.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          <span>{trend.up ? "▲" : "▼"}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  </div>
);

export default StatsCard;
