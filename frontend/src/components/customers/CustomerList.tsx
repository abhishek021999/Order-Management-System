import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, Plus, Users, ChevronLeft, ChevronRight, Search, Mail, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchCustomers, deleteCustomer, setCurrentPage } from "@/store/slices/customerSlice";
import { LoadingSpinner, ConfirmModal } from "@/components/common";
import { formatDate } from "@/utils";
import toast from "react-hot-toast";

const AVATAR_COLORS = [
  "from-brand-400 to-violet-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-sky-400 to-blue-500",
  "from-purple-400 to-indigo-500",
];

const CustomerList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, currentPage, pageSize, loading } = useAppSelector((s) => s.customers);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchCustomers({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await dispatch(deleteCustomer(deleteId));
      toast.success("Customer deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? items.filter((c) =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone_number ?? "").includes(search))
    : items;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const initials = (name: string) => name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  if (loading && items.length === 0) return <LoadingSpinner text="Loading customers…" />;

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{total} customer{total !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => navigate("/customers/new")} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="card p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…" className="form-input pl-9 h-9 text-[13px]" />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={26} /></div>
            <p className="text-slate-700 font-semibold text-sm">No customers found</p>
            <p className="text-slate-400 text-xs mt-1">
              {search ? "Try a different search" : "Add your first customer to get started"}
            </p>
            {!search && (
              <button onClick={() => navigate("/customers/new")} className="btn-primary mt-4 text-xs px-4 py-2">
                <Plus size={14} /> Add Customer
              </button>
            )}
          </div>
        ) : (
          <>
          {/* ── Mobile card list ─────────────────────────────── */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((c, i) => (
              <div key={c.id} className="flex items-start gap-3 px-4 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                  {initials(c.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{c.full_name}</p>
                      <p className="text-[11px] text-slate-400">ID #{c.id}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/customers/${c.id}/edit`)}
                        className="w-8 h-8 rounded-lg text-brand-500 hover:bg-brand-50 flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="w-8 h-8 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                      <Mail size={11} className="text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${c.email}`} className="truncate hover:text-brand-600 transition-colors">
                        {c.email}
                      </a>
                    </div>
                    {c.phone_number && (
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Phone size={11} className="text-slate-400 flex-shrink-0" />
                        {c.phone_number}
                      </div>
                    )}
                    {c.address && (
                      <p className="text-[11px] text-slate-400 truncate">{c.address}</p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">Joined {formatDate(c.created_at)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table ─────────────────────────────────── */}
          <div className="hidden md:block table-container rounded-none border-0">
            <table className="table table-fixed w-full">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th className="w-52">Contact</th>
                  <th className="w-36">Address</th>
                  <th className="w-28">Joined</th>
                  <th className="w-24 !text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                          {initials(c.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-[13px] leading-tight">{c.full_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">ID #{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                          <Mail size={11} className="text-slate-400" />
                          <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-brand-600 transition-colors">{c.email}</a>
                        </div>
                        {c.phone_number && (
                          <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                            <Phone size={11} className="text-slate-400" />
                            {c.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-[12px] text-slate-500 max-w-[160px] truncate block">
                        {c.address ?? <span className="text-slate-300 italic">—</span>}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(c.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => navigate(`/customers/${c.id}/edit`)}
                          className="btn-icon text-brand-500 hover:bg-brand-50 hover:text-brand-700" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(c.id)}
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmLabel="Yes, Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default CustomerList;
