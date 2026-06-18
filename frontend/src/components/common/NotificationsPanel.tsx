import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, CheckCheck, X, Wifi, WifiOff } from "lucide-react";
import { useNotifications, RealtimeNotification } from "@/hooks";

const NotificationsPanel: React.FC = () => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);

  const { notifications, connected, dismiss, clearAll } = useNotifications();

  const unread = notifications.length - seenCount;
  const badge = unread > 0 ? unread : 0;

  // When panel opens, mark all current notifications as seen
  useEffect(() => {
    if (open) setSeenCount(notifications.length);
  }, [open, notifications.length]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleClick = (n: RealtimeNotification) => {
    navigate(n.path);
    setOpen(false);
  };

  const handleClearAll = () => {
    clearAll();
    setSeenCount(0);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-icon relative group"
        aria-label="Notifications"
      >
        <Bell size={17} className="text-slate-500 group-hover:text-slate-700 transition-colors" />
        {badge > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-rose-500 ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white leading-none">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/60 z-50 overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                  {badge} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Connection status */}
              <span
                title={connected ? "Live — real-time updates active" : "Connecting…"}
                className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  connected
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {connected
                  ? <><Wifi size={9} /> Live</>
                  : <><WifiOff size={9} /> Offline</>
                }
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="btn-icon w-7 h-7 text-slate-400 hover:text-emerald-600"
                  title="Clear all"
                >
                  <CheckCheck size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                  <BellOff size={20} className="text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  {connected
                    ? "New orders and stock alerts will appear here"
                    : "Connecting to notification server…"}
                </p>
              </div>
            ) : (
              <>
                {notifications.map((n, idx) => (
                  <NotifRow
                    key={n.id}
                    n={n}
                    isNew={idx < badge}
                    onDismiss={(e) => { e.stopPropagation(); dismiss(n.id); if (seenCount > 0) setSeenCount((s) => s - 1); }}
                    onClick={() => handleClick(n)}
                  />
                ))}
                <div className="h-2" />
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-400 text-center">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · real-time via WebSocket
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface RowProps {
  n: RealtimeNotification;
  isNew: boolean;
  onDismiss: (e: React.MouseEvent) => void;
  onClick: () => void;
}

const NotifRow: React.FC<RowProps> = ({ n, isNew, onDismiss, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-start gap-3 px-4 py-3 text-left group border-b border-slate-50 last:border-0 transition-colors
      ${isNew ? "bg-brand-50/40 hover:bg-brand-50" : "hover:bg-slate-50"}`}
  >
    {/* Unread dot */}
    <div className="flex-shrink-0 mt-1">
      {isNew && <span className="block w-1.5 h-1.5 rounded-full bg-brand-500" />}
      {!isNew && <span className="block w-1.5 h-1.5" />}
    </div>

    {/* Icon */}
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${n.iconBg}`}>
      {n.type === "order_created" && "🛒"}
      {n.type === "order_status_changed" && "📦"}
      {n.type === "order_deleted" && "🗑️"}
      {n.type === "low_stock" && "⚠️"}
    </div>

    {/* Text */}
    <div className="min-w-0 flex-1">
      <p className="text-[12px] font-semibold text-slate-800 leading-snug">{n.title}</p>
      <p className="text-[11px] text-slate-400 truncate mt-0.5">{n.subtitle}</p>
      <p className="text-[10px] text-slate-300 mt-1">{n.time}</p>
    </div>

    {/* Dismiss */}
    <button
      onClick={onDismiss}
      className="w-5 h-5 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5"
    >
      <X size={11} />
    </button>
  </button>
);

export default NotificationsPanel;
