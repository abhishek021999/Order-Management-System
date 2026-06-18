import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";

export interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  path: string;
  iconBg: string;
  time: string;
}

type WsEvent = {
  type: string;
  order_id?: number;
  customer_name?: string;
  total_amount?: number;
  items_count?: number;
  old_status?: string;
  new_status?: string;
  product_id?: number;
  product_name?: string;
  quantity?: number;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function parseEvent(ev: WsEvent): RealtimeNotification | null {
  const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  switch (ev.type) {
    case "order_created":
      return {
        id: `order_created_${ev.order_id}_${Date.now()}`,
        type: ev.type,
        title: `New order #${ev.order_id} placed`,
        subtitle: `${ev.customer_name} · ₹${ev.total_amount?.toFixed(2)} · ${ev.items_count} item(s)`,
        path: `/orders/${ev.order_id}`,
        iconBg: "bg-violet-100 text-violet-600",
        time,
      };

    case "order_status_changed":
      return {
        id: `order_status_${ev.order_id}_${Date.now()}`,
        type: ev.type,
        title: `Order #${ev.order_id} → ${STATUS_LABELS[ev.new_status ?? ""] ?? ev.new_status}`,
        subtitle: ev.customer_name ?? "",
        path: `/orders/${ev.order_id}`,
        iconBg: ev.new_status === "cancelled" ? "bg-rose-100 text-rose-600" : "bg-sky-100 text-sky-600",
        time,
      };

    case "order_deleted":
      return {
        id: `order_deleted_${ev.order_id}_${Date.now()}`,
        type: ev.type,
        title: `Order #${ev.order_id} was deleted`,
        subtitle: "Stock has been restored",
        path: "/orders",
        iconBg: "bg-rose-100 text-rose-600",
        time,
      };

    case "low_stock":
      return {
        id: `low_stock_${ev.product_id}_${Date.now()}`,
        type: ev.type,
        title: ev.quantity === 0 ? `${ev.product_name} is out of stock` : `${ev.product_name} is running low`,
        subtitle: ev.quantity === 0 ? "Restock immediately" : `Only ${ev.quantity} left`,
        path: `/products/${ev.product_id}/edit`,
        iconBg: ev.quantity === 0 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600",
        time,
      };

    default:
      return null;
  }
}

function getToastIcon(type: string): string {
  switch (type) {
    case "order_created": return "🛒";
    case "order_status_changed": return "📦";
    case "order_deleted": return "🗑️";
    case "low_stock": return "⚠️";
    default: return "🔔";
  }
}

const apiUrl = process.env.REACT_APP_API_URL ?? "http://localhost:8000";
const WS_BASE = apiUrl.replace(/^http/, "ws");

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout>>();
  const retryDelay = useRef(1000);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_BASE}/ws/notifications`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retryDelay.current = 1000;
    };

    ws.onmessage = (e) => {
      try {
        const ev: WsEvent = JSON.parse(e.data);
        const notif = parseEvent(ev);
        if (!notif) return;
        setNotifications((prev) => [notif, ...prev].slice(0, 50));
        toast(notif.title, { icon: getToastIcon(ev.type), duration: 4000 });
      } catch { /* malformed message — ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
      // Exponential back-off: 1s → 2s → 4s → max 30s
      retryRef.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, 30000);
        connect();
      }, retryDelay.current);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return { notifications, connected, dismiss, clearAll };
};
