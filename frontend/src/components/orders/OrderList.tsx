import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Eye, ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchOrders, deleteOrder, setCurrentPage } from "@/store/slices/orderSlice";
import { LoadingSpinner, ConfirmModal } from "@/components/common";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS } from "@/utils";
import toast from "react-hot-toast";

const STATUS_BADGE: Record<string, string> = {
  pending:   "badge-amber",
  confirmed: "badge-sky",
  shipped:   "badge-violet",
  delivered: "badge-emerald",
  cancelled: "badge-rose",
};

const OrderList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, currentPage, pageSize, loading } = useAppSelector((s) => s.orders);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchOrders({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await dispatch(deleteOrder(deleteId));
      toast.success("Order deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? items.filter((o) =>
        String(o.id).includes(search) ||
        (o.customer?.full_name ?? "").toLowerCase().includes(search.toLowerCase()))
    : items;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (loading && items.length === 0) return <LoadingSpinner text="Loading orders…" />;

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{total} order{total !== 1 ? "s" : ""} in total</p>
        </div>
        <button onClick={() => navigate("/orders/new")} className="btn-primary">
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="card p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer…" className="form-input pl-9 h-9 text-[13px]" />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShoppingCart size={26} /></div>
            <p className="text-slate-700 font-semibold text-sm">No orders found</p>
            <p className="text-slate-400 text-xs mt-1">
              {search ? "Try a different search" : "Create your first order"}
            </p>
            {!search && (
              <button onClick={() => navigate("/orders/new")} className="btn-primary mt-4 text-xs px-4 py-2">
                <Plus size={14} /> New Order
              </button>
            )}
          </div>
        ) : (
          <>
          {/* ── Mobile card list ─────────────────────────────── */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((o) => (
              <div
                key={o.id}
                className="flex items-start gap-3 px-4 py-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => navigate(`/orders/${o.id}`)}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 flex-shrink-0 mt-0.5">
                  {o.customer?.full_name?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 text-sm truncate">
                      {o.customer?.full_name ?? `Customer #${o.customer_id}`}
                    </span>
                    <span className="font-bold text-slate-900 text-sm flex-shrink-0">
                      {formatCurrency(o.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-brand-600 font-bold text-[11px] bg-brand-50 px-1.5 py-0.5 rounded-md">
                        #{o.id}
                      </span>
                      <span className={`badge text-[10px] ${STATUS_BADGE[o.status] ?? "badge-slate"}`}>
                        {ORDER_STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">{formatDate(o.created_at)}</span>
                  </div>
                  {(o.items?.length ?? 0) > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {o.items!.length} item{o.items!.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(o.id); }}
                  className="flex-shrink-0 w-8 h-8 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* ── Desktop table ─────────────────────────────────── */}
          <div className="hidden md:block table-container rounded-none border-0">
            <table className="table table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-20">Order</th>
                  <th>Customer</th>
                  <th className="w-16 !text-center">Items</th>
                  <th className="w-28 !text-right">Total</th>
                  <th className="w-32">Status</th>
                  <th className="w-28">Date</th>
                  <th className="w-24 !text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
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
                          {o.customer?.full_name ?? `Customer #${o.customer_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="text-center text-[12px] text-slate-500">
                      {o.items?.length ?? 0}
                    </td>
                    <td className="text-right font-bold text-slate-900">{formatCurrency(o.total_amount)}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[o.status] ?? "badge-slate"}`}>
                        {ORDER_STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(o.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => navigate(`/orders/${o.id}`)}
                          className="btn-icon text-brand-500 hover:bg-brand-50 hover:text-brand-700" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setDeleteId(o.id)}
                          className="btn-icon text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {total > pageSize && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
            <p className="text-xs text-slate-500">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
              <span className="text-slate-300 ml-1">· {total} total</span>
            </p>
            <div className="flex gap-1">
              <button disabled={currentPage === 1} onClick={() => dispatch(setCurrentPage(currentPage - 1))} className="btn-icon disabled:opacity-30">
                <ChevronLeft size={15} />
              </button>
              <button disabled={currentPage >= totalPages} onClick={() => dispatch(setCurrentPage(currentPage + 1))} className="btn-icon disabled:opacity-30">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        open={deleteId !== null}
        title="Delete Order"
        message={`Are you sure you want to delete Order #${deleteId}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default OrderList;
