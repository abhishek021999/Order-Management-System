import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Save, AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { createCustomer, updateCustomer } from "@/store/slices/customerSlice";
import { customerService } from "@/services";
import { CustomerCreate, CustomerUpdate } from "@/types";
import { LoadingSpinner } from "@/components/common";
import toast from "react-hot-toast";

interface FormState {
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
}

const EMPTY: FormState = { full_name: "", email: "", phone_number: "", address: "" };

const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    setFetching(true);
    customerService.getById(Number(id))
      .then((c) => setForm({
        full_name: c.full_name,
        email: c.email,
        phone_number: c.phone_number ?? "",
        address: c.address ?? "",
      }))
      .catch(() => { toast.error("Customer not found"); navigate("/customers"); })
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((err) => ({ ...err, [k]: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((f) => ({ ...f, phone_number: digits }));
    setErrors((err) => ({ ...err, phone_number: undefined }));
  };

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (form.phone_number && !/^[6-9]\d{9}$/.test(form.phone_number))
      e.phone_number = "Enter a valid 10-digit Indian mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        const update: CustomerUpdate = {
          full_name: form.full_name.trim(),
          phone_number: form.phone_number.trim() || undefined,
          address: form.address.trim() || undefined,
        };
        await dispatch(updateCustomer({ id: Number(id), customer: update }));
        toast.success("Customer updated");
      } else {
        const create: CustomerCreate = {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim() || undefined,
          address: form.address.trim() || undefined,
        };
        const newCustomer = await dispatch(createCustomer(create)).unwrap();
        toast.success("Customer created");
        navigate(`/customers/${newCustomer.id}/edit`);
        return;
      }
      navigate("/customers");
    } catch {
      toast.error(`Failed to ${isEdit ? "update" : "create"} customer`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner text="Loading customer…" />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <button onClick={() => navigate("/customers")} className="btn-ghost text-xs mb-2 -ml-2 text-slate-500 gap-1.5">
            <ArrowLeft size={13} /> Back to Customers
          </button>
          <h1 className="page-title">{isEdit ? "Edit Customer" : "New Customer"}</h1>
          <p className="page-subtitle">{isEdit ? "Update customer information" : "Add a new customer to your system"}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center border border-emerald-100/50">
          <Users size={20} className="text-emerald-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-5">
          <div>
            <label className="form-label">Full Name <span className="text-rose-500">*</span></label>
            <input value={form.full_name} onChange={set("full_name")} placeholder="e.g. Jane Smith"
              className={errors.full_name ? "form-input-error" : "form-input"} />
            {errors.full_name && <p className="form-error"><AlertCircle size={12} /> {errors.full_name}</p>}
          </div>

          <div>
            <label className="form-label">Email Address <span className="text-rose-500">*</span></label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="jane@example.com"
              disabled={isEdit}
              className={errors.email ? "form-input-error" : "form-input"} />
            {isEdit && <p className="form-hint">Email cannot be changed after account creation.</p>}
            {errors.email && <p className="form-error"><AlertCircle size={12} /> {errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none select-none">+91</span>
                <input
                  type="tel" inputMode="numeric" value={form.phone_number}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  maxLength={10}
                  className={`${errors.phone_number ? "form-input-error" : "form-input"} pl-12 font-mono tracking-wide`}
                />
              </div>
              {errors.phone_number
                ? <p className="form-error"><AlertCircle size={12} /> {errors.phone_number}</p>
                : <p className="form-hint">10-digit mobile number starting with 6–9</p>}
            </div>
            <div>
              <label className="form-label">Address <span className="text-slate-400 font-normal">(optional)</span></label>
              <input value={form.address} onChange={set("address")} placeholder="123 Main St, City"
                className="form-input" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <button type="button" onClick={() => navigate("/customers")} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary min-w-[150px]">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <><Save size={15} /> {isEdit ? "Update" : "Create"} Customer</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
