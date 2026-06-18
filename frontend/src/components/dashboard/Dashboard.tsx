import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchOrders, fetchDashboardStats } from "@/store/slices/orderSlice";
import { LoadingSpinner } from "@/components/common";
import StatsCard from "./StatsCard";
import {
  Package, Users, ShoppingCart, DollarSign,
  AlertTriangle, ArrowRight, TrendingUp, Zap,
  ChevronRight, BarChart2,
} from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/utils";

const STATUS_BADGE: Record<string, string> = {
  pending:   "badge-amber",
  confirmed: "badge-sky",
  shipped:   "badge-violet",
  delivered: "badge-emerald",
  cancelled: "badge-rose",
};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, statsLoading, items: orders } = useAppSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchOrders({ page: 1, pageSize: 6 }));
  }, [dispatch]);

  if (statsLoading || !stats) return <LoadingSpinner text="Loading dashboard…" />;

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0a0f1e] p-7 text-white">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -right-8 bottom-0 w-48 h-48 rounded-full bg-violet-600/15 blur-2xl" />
        <div className="absolute left-1/3 -bottom-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-400/20 rounded-full px-3 py-1 text-xs text-brand-300 font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              System Online
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-sm">
              Here's what's happening with your inventory today.
            </p>
            <p className="text-slate-600 text-xs mt-2 font-medium">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col">
            <button
              onClick={() => navigate("/orders/new")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors shadow-brand"
            >
              <Zap size={15} /> New Order
            </button>
            <button
              onClick={() => navigate("/products/new")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium transition-colors"
            >
              <Package size={15} /> Add Product
            </button>
            <button
              onClick={() => navigate("/customers/new")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 text-white text-sm font-medium transition-colors"
            >
              <Users size={15} /> Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Products"
          value={stats.total_products.toLocaleString()}
          icon={<Package size={22} className="text-brand-600" />}
          iconBg="bg-gradient-to-br from-brand-50 to-indigo-100"
          subtitle="In catalogue"
          onClick={() => navigate("/products")}
        />
        <StatsCard
          title="Customers"
          value={stats.total_customers.toLocaleString()}
          icon={<Users size={22} className="text-emerald-600" />}
          iconBg="bg-gradient-to-br from-emerald-50 to-teal-100"
          subtitle="Registered"
          onClick={() => navigate("/customers")}
        />
        <StatsCard
          title="Total Orders"
          value={stats.total_orders.toLocaleString()}
          icon={<ShoppingCart size={22} className="text-violet-600" />}
          iconBg="bg-gradient-to-br from-violet-50 to-purple-100"
          subtitle="All time"
          onClick={() => navigate("/orders")}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats.total_revenue)}
          icon={<DollarSign size={22} className="text-amber-600" />}
          iconBg="bg-gradient-to-br from-amber-50 to-orange-100"
          subtitle="Excl. cancelled"
          trend={{ value: "All time", up: true }}
          onClick={() => navigate("/orders")}
        />
      </div>

      {/* ── Main grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Recent orders table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="card-header">
            <div>
              <h2 className="font-bold text-slate-900 text-sm tracking-tight">Recent Orders</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest {orders.length} transactions</p>
            </div>
            <button
              onClick={() => navigate("/orders")}
              className="btn-ghost text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 gap-1"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state py-14">
              <div className="empty-state-icon"><BarChart2 size={26} /></div>
              <p className="text-slate-600 font-semibold text-sm">No orders yet</p>
              <p className="text-slate-400 text-xs mt-1">Create your first order to see it here</p>
              <button onClick={() => navigate("/orders/new")} className="btn-primary mt-4 text-xs px-4 py-2">
                <Zap size={13} /> New Order
              </button>
            </div>
          ) : (
            <div className="table-container rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr
                      key={o.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/orders/${o.id}`)}
                    >
                      <td>
                        <span className="font-mono text-brand-600 font-bold text-xs bg-brand-50 px-2 py-0.5 rounded-lg">
                          #{o.id}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                            {o.customer?.full_name?.[0] ?? "?"}
                          </div>
                          <span className="font-medium text-slate-800 text-[13px]">
                            {o.customer?.full_name ?? `#${o.customer_id}`}
                          </span>
                        </div>
                      </td>
                      <td className="font-bold text-slate-900">{formatCurrency(o.total_amount)}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[o.status] ?? "badge-slate"}`}>
                          {ORDER_STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="text-slate-400 text-xs">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock panel */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Low Stock</h2>
                <p className="text-[11px] text-slate-400">≤ 10 units</p>
              </div>
            </div>
            <button onClick={() => navigate("/products")} className="btn-ghost text-xs gap-1 text-brand-600 hover:bg-brand-50">
              View <ChevronRight size={13} />
            </button>
          </div>

          {stats.low_stock_products.length === 0 ? (
            <div className="empty-state py-12">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <TrendingUp size={22} className="text-emerald-500" />
              </div>
              <p className="text-slate-700 text-sm font-semibold">All stocked up!</p>
              <p className="text-slate-400 text-xs mt-1">No low-stock items right now</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {stats.low_stock_products.map((p) => {
                const pct = Math.max(4, Math.min(100, (p.quantity / 10) * 100));
                const color = p.quantity <= 3 ? "bg-rose-500" : p.quantity <= 6 ? "bg-amber-500" : "bg-amber-400";
                return (
                  <div key={p.id} onClick={() => navigate(`/products/${p.id}/edit`)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-[11px] font-bold ${p.quantity <= 3 ? "text-rose-600" : "text-amber-600"}`}>
                          {p.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
