import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Save, AlertCircle, RefreshCw } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { createProduct, updateProduct } from "@/store/slices/productSlice";
import { productService } from "@/services";
import { ProductCreate, ProductUpdate } from "@/types";
import { LoadingSpinner } from "@/components/common";
import toast from "react-hot-toast";

interface FormState {
  name: string;
  sku: string;
  price: string;
  quantity: string;
  description: string;
}

const EMPTY: FormState = { name: "", sku: "", price: "", quantity: "0", description: "" };

const generateSku = (name: string): string => {
  const prefix = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return prefix ? `${prefix}-${suffix}` : `PRD-${suffix}`;
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [skuLocked, setSkuLocked] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    setFetching(true);
    productService.getById(Number(id))
      .then((p) => setForm({
        name: p.name,
        sku: p.sku,
        price: String(p.price),
        quantity: String(p.quantity),
        description: p.description ?? "",
      }))
      .catch(() => { toast.error("Product not found"); navigate("/products"); })
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: val };
      if (k === "name" && !skuLocked) {
        next.sku = val.trim() ? generateSku(val) : "";
      }
      return next;
    });
    setErrors((err) => ({ ...err, [k]: undefined }));
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkuLocked(true);
    setForm((f) => ({ ...f, sku: e.target.value }));
    setErrors((err) => ({ ...err, sku: undefined }));
  };

  const regenerateSku = useCallback(() => {
    const sku = generateSku(form.name);
    setForm((f) => ({ ...f, sku }));
    setSkuLocked(false);
    setErrors((err) => ({ ...err, sku: undefined }));
  }, [form.name]);

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Valid price required";
    if (form.quantity && (isNaN(Number(form.quantity)) || Number(form.quantity) < 0)) e.quantity = "Valid quantity required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        const update: ProductUpdate = {
          name: form.name.trim(),
          price: Number(form.price),
          quantity: Number(form.quantity),
          description: form.description.trim() || undefined,
        };
        await dispatch(updateProduct({ id: Number(id), product: update }));
        toast.success("Product updated");
      } else {
        const create: ProductCreate = {
          name: form.name.trim(),
          sku: form.sku.trim(),
          price: Number(form.price),
          quantity: Number(form.quantity),
          description: form.description.trim() || undefined,
        };
        const newProduct = await dispatch(createProduct(create)).unwrap();
        toast.success("Product created");
        navigate(`/products/${newProduct.id}/edit`);
        return;
      }
      navigate("/products");
    } catch {
      toast.error(`Failed to ${isEdit ? "update" : "create"} product`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner text="Loading product…" />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <button onClick={() => navigate("/products")} className="btn-ghost text-xs mb-2 -ml-2 text-slate-500 gap-1.5">
            <ArrowLeft size={13} /> Back to Products
          </button>
          <h1 className="page-title">{isEdit ? "Edit Product" : "New Product"}</h1>
          <p className="page-subtitle">{isEdit ? "Update product details" : "Add a new product to your catalogue"}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-100 flex items-center justify-center border border-brand-100/50">
          <Package size={20} className="text-brand-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-5">
          <div>
            <label className="form-label">Product Name <span className="text-rose-500">*</span></label>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Wireless Keyboard" className={errors.name ? "form-input-error" : "form-input"} />
            {errors.name && <p className="form-error"><AlertCircle size={12} /> {errors.name}</p>}
          </div>

          <div>
            <label className="form-label">
              SKU <span className="text-rose-500">*</span>
              {!isEdit && <span className="ml-2 text-[11px] font-normal text-slate-400">Auto-generated from name</span>}
            </label>
            <div className="flex gap-2">
              <input
                value={form.sku}
                onChange={isEdit ? undefined : handleSkuChange}
                placeholder="e.g. KB-001"
                disabled={isEdit}
                className={`${errors.sku ? "form-input-error" : "form-input"} font-mono flex-1`}
              />
              {!isEdit && (
                <button
                  type="button"
                  onClick={regenerateSku}
                  title="Regenerate SKU"
                  className="btn-secondary px-3 flex-shrink-0"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
            {isEdit && <p className="form-hint">SKU cannot be changed after creation.</p>}
            {errors.sku && <p className="form-error"><AlertCircle size={12} /> {errors.sku}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price (INR) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">₹</span>
                <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00"
                  className={`${errors.price ? "form-input-error" : "form-input"} pl-7`} />
              </div>
              {errors.price && <p className="form-error"><AlertCircle size={12} /> {errors.price}</p>}
            </div>
            <div>
              <label className="form-label">Stock Quantity</label>
              <input type="number" min="0" step="1" value={form.quantity} onChange={set("quantity")} placeholder="0"
                className={errors.quantity ? "form-input-error" : "form-input"} />
              {errors.quantity && <p className="form-error"><AlertCircle size={12} /> {errors.quantity}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea value={form.description} onChange={set("description")} rows={3}
              placeholder="Short product description…" className="form-input resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <button type="button" onClick={() => navigate("/products")} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary min-w-[140px]">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <><Save size={15} /> {isEdit ? "Update" : "Create"} Product</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
