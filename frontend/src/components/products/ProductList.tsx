import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, Plus, Package, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchProducts, deleteProduct, setCurrentPage } from "@/store/slices/productSlice";
import { LoadingSpinner, ConfirmModal } from "@/components/common";
import { formatCurrency } from "@/utils";
import toast from "react-hot-toast";

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, currentPage, pageSize, loading } = useAppSelector((s) => s.products);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await dispatch(deleteProduct(deleteId));
      toast.success("Product deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? items.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()))
    : items;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (loading && items.length === 0) return <LoadingSpinner text="Loading products…" />;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{total} product{total !== 1 ? "s" : ""} in your catalogue</p>
        </div>
        <button onClick={() => navigate("/products/new")} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="card p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU…"
            className="form-input pl-9 h-9 text-[13px]"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <SlidersHorizontal size={13} />
          <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Package size={26} /></div>
            <p className="text-slate-700 font-semibold text-sm">No products found</p>
            <p className="text-slate-400 text-xs mt-1">
              {search ? "Try a different search term" : "Add your first product to get started"}
            </p>
            {!search && (
              <button onClick={() => navigate("/products/new")} className="btn-primary mt-4 text-xs px-4 py-2">
                <Plus size={14} /> Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="table-container rounded-none border-0">
            <table className="table table-fixed w-full">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Product</th>
                  <th className="w-28">SKU</th>
                  <th className="w-28 !text-right">Price</th>
                  <th className="w-32">Stock</th>
                  <th className="w-24 !text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-slate-300 text-xs">{(currentPage - 1) * pageSize + i + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center flex-shrink-0 border border-brand-100/50">
                          <Package size={15} className="text-brand-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-[13px] leading-tight truncate">{p.name}</p>
                          {p.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{p.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60">
                        {p.sku}
                      </span>
                    </td>
                    <td className="text-right font-bold text-slate-900">{formatCurrency(p.price)}</td>
                    <td>
                      <span className={`badge text-[11px] ${
                        p.quantity === 0 ? "badge-rose" :
                        p.quantity <= 10 ? "badge-amber" : "badge-emerald"
                      }`}>
                        {p.quantity === 0 ? "Out of stock" : `${p.quantity} units`}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          className="btn-icon text-brand-500 hover:bg-brand-50 hover:text-brand-700"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="btn-icon text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Yes, Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ProductList;
