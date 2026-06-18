import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, User, Calendar, Tag,
  Package, CheckCircle2, Clock, Truck, XCircle, RefreshCw, ChevronRight,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { orderService } from "@/services";
import { useAppDispatch } from "@/hooks";
import { updateOrder } from "@/store/slices/orderSlice";
import { LoadingSpinner } from "@/components/common";
import { formatCurrency, formatDateTime, ORDER_STATUS_LABELS } from "@/utils";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  pending:   "badge-amber",
  confirmed: "badge-sky",
  shipped:   "badge-violet",
  delivered: "badge-emerald",
  cancelled: "badge-rose",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:   <Clock size={13} />,
  confirmed: <CheckCircle2 size={13} />,
  shipped:   <Truck size={13} />,
  delivered: <CheckCircle2 size={13} />,
  cancelled: <XCircle size={13} />,
};

const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderService.getById(Number(id))
      .then(setOrder)
      .catch(() => { toast.error("Order not found"); navigate("/orders"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await dispatch(updateOrder({ id: order.id, order: { status } })).unwrap();
      setOrder(updated);
      toast.success(`Order marked as ${ORDER_STATUS_LABELS[status]}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading order…" />;
  if (!order) return null;

  const isCancelled = order.status === OrderStatus.CANCELLED;
  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status as OrderStatus) + 1];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <button onClick={() => navigate("/orders")} className="btn-ghost text-xs mb-2 -ml-2 text-slate-500 gap-1.5">
            <ArrowLeft size={13} /> Back to Orders
          </button>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Order #{order.id}</h1>
            <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-slate"}`}>
              {STATUS_ICON[order.status]}
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="page-subtitle">Placed on {formatDateTime(order.created_at)}</p>
        </div>

        {/* Status actions */}
        {!isCancelled && (
          <div className="flex flex-col gap-2 items-end">
            {nextStatus && (
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={updating}
                className="btn-primary text-xs px-4 py-2 gap-2"
              >
                {updating ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                Mark as {ORDER_STATUS_LABELS[nextStatus]}
              </button>
            )}
            {order.status !== OrderStatus.DELIVERED && (
              <button
                onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
                disabled={updating}
                className="btn-ghost text-xs text-rose-600 hover:bg-rose-50 gap-1.5"
              >
                <XCircle size={13} /> Cancel Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card px-6 py-5">
          <div className="flex items-center gap-0">
            {STATUS_FLOW.map((s, idx) => {
              const stepIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);
              const done = idx <= stepIdx;
              const active = idx === stepIdx;
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      done
                        ? active
                          ? "bg-brand-600 text-white shadow-brand"
                          : "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {done && !active ? <CheckCircle2 size={15} /> : STATUS_ICON[s]}
                    </div>
                    <p className={`text-[10px] font-semibold whitespace-nowrap ${done ? (active ? "text-brand-600" : "text-emerald-600") : "text-slate-400"}`}>
                      {ORDER_STATUS_LABELS[s]}
                    </p>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${idx < stepIdx ? "bg-emerald-400" : "bg-slate-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Two-column detail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer info */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
                <User size={14} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Customer</h2>
            </div>
          </div>
          <div className="card-body space-y-3">
            {order.customer ? (
              <>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Name</p>
                  <button
                    onClick={() => navigate(`/customers/${order.customer_id}/edit`)}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors text-left"
                  >
                    {order.customer.full_name}
                  </button>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Email</p>
                  <a href={`mailto:${order.customer.email}`} className="text-sm text-slate-700 hover:text-brand-600 transition-colors">
                    {order.customer.email}
                  </a>
                </div>
                {order.customer.phone_number && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-sm text-slate-700">{order.customer.phone_number}</p>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/customers/${order.customer_id}/edit`)}
                  className="mt-1 text-[11px] text-brand-500 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  View customer profile <ChevronRight size={11} />
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-400">Customer #{order.customer_id}</p>
            )}
          </div>
        </div>

        {/* Order meta */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center">
                <Tag size={14} className="text-brand-500" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Order Info</h2>
            </div>
          </div>
          <div className="card-body space-y-3">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Order ID</p>
              <p className="font-mono text-sm font-bold text-brand-600">#{order.id}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Status</p>
              <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-slate"}`}>
                {STATUS_ICON[order.status]} {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Created</p>
              <p className="text-sm text-slate-700 flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400" /> {formatDateTime(order.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center">
              <ShoppingCart size={14} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Order Items</h2>
              <p className="text-[11px] text-slate-400">{order.items.length} product{order.items.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        <div className="table-container rounded-none border-0">
          <table className="table table-fixed w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th className="w-28">SKU</th>
                <th className="w-16 !text-center">Qty</th>
                <th className="w-28 !text-right">Unit Price</th>
                <th className="w-28 !text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center border border-brand-100/40 flex-shrink-0">
                        <Package size={13} className="text-brand-500" />
                      </div>
                      <p className="font-semibold text-slate-800 text-[13px]">
                        {item.product_name ?? `Product #${item.product_id}`}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200/60">
                      {item.product_sku ?? "—"}
                    </span>
                  </td>
                  <td className="text-center font-semibold text-slate-700">{item.quantity}</td>
                  <td className="text-right text-slate-700">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right font-bold text-slate-900">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="px-4 py-4 text-right font-bold text-slate-700">
                  Order Total
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-xl font-extrabold text-slate-900">{formatCurrency(order.total_amount)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
