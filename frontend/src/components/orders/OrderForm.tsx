import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Trash2, AlertCircle, Search, X } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { createOrder } from "@/store/slices/orderSlice";
import { customerService, productService } from "@/services";
import { Customer, Product, OrderItemCreate } from "@/types";
import { LoadingSpinner } from "@/components/common";
import { formatCurrency } from "@/utils";
import toast from "react-hot-toast";

interface LineItem {
  product_id: number;
  product: Product;
  quantity: number;
}

const OrderForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [customerId, setCustomerId] = useState<number | "">("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [items, setItems] = useState<LineItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ customer?: string; items?: string }>({});

  useEffect(() => {
    Promise.all([
      customerService.getAll(1, 500),
      productService.getAll(1, 500),
    ]).then(([c, p]) => {
      setCustomers(c.items);
      setProducts(p.items);
    }).catch(() => toast.error("Failed to load data"))
      .finally(() => setDataLoading(false));
  }, []);

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null;

  const filteredCustomers = customerSearch
    ? customers.filter((c) =>
        c.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.phone_number ?? "").includes(customerSearch))
    : customers.slice(0, 8);

  const availableProducts = products.filter(
    (p) => !items.some((i) => i.product_id === p.id)
  ).filter((p) =>
    productSearch
      ? p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
      : true
  );

  const addItem = (product: Product) => {
    setItems((prev) => [...prev, { product_id: product.id, product, quantity: 1 }]);
    setProductSearch("");
    setErrors((e) => ({ ...e, items: undefined }));
  };

  const updateQty = (productId: number, qty: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.product_id !== productId) return i;
        const capped = Math.min(Math.max(1, qty), i.product.quantity);
        if (qty > i.product.quantity) toast.error(`Only ${i.product.quantity} in stock`);
        return { ...i, quantity: capped };
      })
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const validate = () => {
    const e: typeof errors = {};
    if (!customerId) e.customer = "Please select a customer";
    if (items.length === 0) e.items = "Add at least one product";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orderItems: OrderItemCreate[] = items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));
      const newOrder = await dispatch(createOrder({ customer_id: Number(customerId), items: orderItems })).unwrap();
      toast.success("Order created successfully");
      navigate(`/orders/${newOrder.id}`);
    } catch {
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (dataLoading) return <LoadingSpinner text="Loading data…" />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <button onClick={() => navigate("/orders")} className="btn-ghost text-xs mb-2 -ml-2 text-slate-500 gap-1.5">
            <ArrowLeft size={13} /> Back to Orders
          </button>
          <h1 className="page-title">New Order</h1>
          <p className="page-subtitle">Create a new order by selecting a customer and adding products</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center border border-violet-100/50">
          <ShoppingCart size={20} className="text-violet-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer selection */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-slate-900 text-sm">Customer</h2>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                {customers.length} total
              </span>
            </div>
            <div className="flex items-center gap-2">
              {errors.customer && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.customer}
                </p>
              )}
              {customerId && (
                <button
                  type="button"
                  onClick={() => { setCustomerId(""); setCustomerSearch(""); setCustomerDropdownOpen(false); }}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>
          </div>
          <div className="card-body space-y-3">
            {/* Selected customer chip */}
            {selectedCustomer && !customerDropdownOpen ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {selectedCustomer.full_name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-emerald-800 text-[13px] truncate">{selectedCustomer.full_name}</p>
                  <p className="text-[11px] text-emerald-600 truncate">{selectedCustomer.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setCustomerSearch(""); setCustomerDropdownOpen(true); }}
                  className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors flex-shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    autoFocus={customerDropdownOpen}
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setCustomerDropdownOpen(true); }}
                    onFocus={() => setCustomerDropdownOpen(true)}
                    placeholder={`Search among ${customers.length} customers…`}
                    className="form-input pl-9 h-9 text-[13px]"
                  />
                  {customerSearch && (
                    <button type="button" onClick={() => setCustomerSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={13} />
                    </button>
                  )}
                </div>

                {!customerSearch && (
                  <p className="text-[11px] text-slate-400 px-1">
                    Showing recent 8 — type to search all {customers.length}
                  </p>
                )}

                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No customers match "{customerSearch}"</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
                    {filteredCustomers.map((c) => (
                      <button
                        type="button" key={c.id}
                        onClick={() => {
                          setCustomerId((prev) => prev === c.id ? "" : c.id);
                          setCustomerSearch("");
                          setCustomerDropdownOpen(false);
                          setErrors((e) => ({ ...e, customer: undefined }));
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-[13px] transition-all duration-150 ${
                          customerId === c.id
                            ? "bg-brand-50 border border-brand-200 text-brand-800"
                            : "hover:bg-slate-50 border border-transparent text-slate-700"
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {c.full_name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{c.full_name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                        </div>
                        {c.phone_number && (
                          <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 hidden sm:block">
                            {c.phone_number}
                          </span>
                        )}
                        {customerId === c.id && (
                          <div className="ml-auto w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                      </button>
                    ))}
                    {!customerSearch && customers.length > 8 && (
                      <p className="text-center text-[11px] text-slate-400 py-2">
                        +{customers.length - 8} more — type to search
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Product picker */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm">
              Products
              {items.length > 0 && <span className="ml-2 badge badge-indigo text-[10px]">{items.length}</span>}
            </h2>
            {errors.items && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.items}
              </p>
            )}
          </div>
          <div className="card-body space-y-4">
            {/* Add product */}
            <div>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search and add products…" className="form-input pl-9 h-9 text-[13px]" />
              </div>
              {productSearch && (
                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-card">
                  {availableProducts.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No matching products available</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto scrollbar-thin">
                      {availableProducts.slice(0, 20).map((p) => {
                        const outOfStock = p.quantity === 0;
                        return (
                          <button
                            type="button" key={p.id}
                            onClick={() => !outOfStock && addItem(p)}
                            disabled={outOfStock}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-slate-100 last:border-0
                              ${outOfStock ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-brand-50 cursor-pointer"}`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                              ${outOfStock ? "bg-slate-100" : "bg-gradient-to-br from-brand-50 to-indigo-100"}`}>
                              <span className={`text-[10px] font-bold ${outOfStock ? "text-slate-400" : "text-brand-500"}`}>P</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[13px] font-bold text-slate-900">{formatCurrency(p.price)}</p>
                              <p className={`text-[10px] font-semibold ${outOfStock ? "text-rose-500" : "text-emerald-600"}`}>
                                {outOfStock ? "Out of stock" : `${p.quantity} available`}
                              </p>
                            </div>
                            {outOfStock
                              ? <X size={13} className="text-rose-400 flex-shrink-0" />
                              : <Plus size={14} className="text-brand-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Line items */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <ShoppingCart size={22} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No products added yet</p>
                <p className="text-xs text-slate-300 mt-1">Search above to add products to this order</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table table-fixed w-full">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="w-44 !text-center">Qty</th>
                      <th className="w-32 !text-right">Amount</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.product_id}>
                        <td>
                          <p className="font-semibold text-slate-800 text-[13px]">{item.product.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{item.product.sku} · {formatCurrency(item.product.price)} each</p>
                        </td>
                        <td className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              <button type="button"
                                onClick={() => updateQty(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                −
                              </button>
                              <input
                                type="number" min="1" max={item.product.quantity}
                                value={item.quantity}
                                onChange={(e) => updateQty(item.product_id, Number(e.target.value))}
                                className={`w-12 text-center text-sm font-semibold border rounded-lg py-0.5 focus:outline-none transition-colors
                                  ${item.quantity >= item.product.quantity
                                    ? "border-amber-400 bg-amber-50 text-amber-700 focus:border-amber-500"
                                    : "border-slate-200 focus:border-brand-500"}`}
                              />
                              <button type="button"
                                onClick={() => updateQty(item.product_id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.quantity}
                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                +
                              </button>
                            </div>
                            <p className={`text-[10px] font-medium ${item.quantity >= item.product.quantity ? "text-amber-600" : "text-slate-400"}`}>
                              {item.quantity >= item.product.quantity ? "Max stock" : `of ${item.product.quantity}`}
                            </p>
                          </div>
                        </td>
                        <td className="text-right font-bold text-slate-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </td>
                        <td>
                          <button type="button" onClick={() => removeItem(item.product_id)}
                            className="btn-icon text-slate-400 hover:text-rose-600 hover:bg-rose-50 w-7 h-7">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-sm font-bold text-slate-700 text-right">Order Total</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-lg font-extrabold text-slate-900">{formatCurrency(total)}</span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate("/orders")} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary min-w-[160px]">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : (
              <><ShoppingCart size={15} /> Place Order · {formatCurrency(total)}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
