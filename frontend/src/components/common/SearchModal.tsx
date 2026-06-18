import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Package, Users, ShoppingCart, ArrowRight, Clock } from "lucide-react";
import { productService, customerService, orderService } from "@/services";
import { Product, Customer, Order } from "@/types";
import { formatCurrency } from "@/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SearchResults {
  products: Product[];
  customers: Customer[];
  orders: Order[];
}

const RECENT_KEY = "search_recent";
const MAX_RECENT = 5;

const getRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
  catch { return []; }
};
const addRecent = (q: string) => {
  const prev = getRecent().filter((r) => r !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
};

const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ products: [], customers: [], orders: [] });
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults({ products: [], customers: [], orders: [] });
      setRecent(getRecent());
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults({ products: [], customers: [], orders: [] }); return; }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [p, c, o] = await Promise.all([
          productService.getAll(1, 200),
          customerService.getAll(1, 200),
          orderService.getAll(1, 200),
        ]);
        const lq = q.toLowerCase();
        setResults({
          products: p.items
            .filter((x) => x.name.toLowerCase().includes(lq) || x.sku.toLowerCase().includes(lq))
            .slice(0, 5),
          customers: c.items
            .filter((x) => x.full_name.toLowerCase().includes(lq) || x.email.toLowerCase().includes(lq) || (x.phone_number ?? "").includes(lq))
            .slice(0, 5),
          orders: o.items
            .filter((x) => String(x.id).includes(lq) || (x.customer?.full_name ?? "").toLowerCase().includes(lq))
            .slice(0, 5),
        });
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const go = (path: string) => {
    if (query.trim()) addRecent(query.trim());
    setRecent(getRecent());
    navigate(path);
    onClose();
  };

  const runRecent = (r: string) => setQuery(r);

  const total = results.products.length + results.customers.length + results.orders.length;
  const hasQuery = query.trim().length > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/60 animate-slide-up">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          {loading
            ? <span className="w-4 h-4 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin flex-shrink-0" />
            : <Search size={16} className="text-slate-400 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, customers, orders…"
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-500 ml-1">
            ESC
          </kbd>
        </div>

        {/* Body */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-thin">

          {/* Empty — show recent searches */}
          {!hasQuery && (
            <div className="py-4">
              {recent.length > 0 ? (
                <>
                  <p className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Searches</p>
                  {recent.map((r) => (
                    <button key={r} onClick={() => runRecent(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group">
                      <Clock size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-600 flex-1">{r}</span>
                      <ArrowRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
                    className="mx-4 mt-2 text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                    Clear recent
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Search size={28} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Start typing to search across all records</p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1"><Package size={11} /> Products</span>
                    <span className="flex items-center gap-1"><Users size={11} /> Customers</span>
                    <span className="flex items-center gap-1"><ShoppingCart size={11} /> Orders</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {hasQuery && !loading && total === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-slate-500">
                No results for <span className="font-semibold text-slate-700">"{query}"</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Try a different name, SKU, email or order number</p>
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div>
              <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Package size={10} /> Products
                <span className="text-slate-300">· {results.products.length}</span>
              </p>
              {results.products.map((p) => (
                <button key={p.id} onClick={() => go(`/products/${p.id}/edit`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-100 border border-brand-100/60 flex items-center justify-center flex-shrink-0">
                    <Package size={13} className="text-brand-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{p.sku} · {formatCurrency(p.price)}</p>
                  </div>
                  {p.quantity <= 5 && (
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      Low stock
                    </span>
                  )}
                  <ArrowRight size={13} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Customers */}
          {results.customers.length > 0 && (
            <div>
              <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users size={10} /> Customers
                <span className="text-slate-300">· {results.customers.length}</span>
              </p>
              {results.customers.map((c) => (
                <button key={c.id} onClick={() => go(`/customers/${c.id}/edit`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {c.full_name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                  </div>
                  <ArrowRight size={13} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Orders */}
          {results.orders.length > 0 && (
            <div>
              <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingCart size={10} /> Orders
                <span className="text-slate-300">· {results.orders.length}</span>
              </p>
              {results.orders.map((o) => (
                <button key={o.id} onClick={() => go(`/orders/${o.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 border border-violet-100/60 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={13} className="text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">Order #{o.id}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {o.customer?.full_name ?? "—"} · {formatCurrency(o.total_amount)}
                    </p>
                  </div>
                  <ArrowRight size={13} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {total > 0 && <div className="h-3" />}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/80">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <kbd className="inline-flex items-center h-4 px-1 rounded bg-white border border-slate-200 text-[9px] font-medium text-slate-500">↵</kbd>
            to select
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <kbd className="inline-flex items-center h-4 px-1 rounded bg-white border border-slate-200 text-[9px] font-medium text-slate-500">ESC</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
