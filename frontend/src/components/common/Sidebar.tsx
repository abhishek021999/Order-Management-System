import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Package, Users, ShoppingCart, X,
  Zap, ChevronRight, Box, Plus,
} from "lucide-react";

interface Props { isOpen: boolean; onClose: () => void; }

const NAV = [
  { label: "Dashboard", path: "/",          icon: LayoutGrid,   color: "text-indigo-400",  addPath: null,             addLabel: null },
  { label: "Products",  path: "/products",  icon: Package,      color: "text-violet-400",  addPath: "/products/new",  addLabel: "Add product" },
  { label: "Customers", path: "/customers", icon: Users,        color: "text-emerald-400", addPath: "/customers/new", addLabel: "Add customer" },
  { label: "Orders",    path: "/orders",    icon: ShoppingCart, color: "text-amber-400",   addPath: "/orders/new",    addLabel: "New order" },
];

const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) => p === "/" ? pathname === "/" : pathname.startsWith(p);

  const handleAdd = (e: React.MouseEvent, addPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    navigate(addPath);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-60 z-50
        flex flex-col
        bg-[#0a0f1e] border-r border-white/[0.04]
        transition-transform duration-300 ease-out
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-brand-900/30 to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center justify-between h-14 px-4 flex-shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 blur-sm opacity-60" />
              <div className="relative w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand">
                <Box size={13} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight leading-none">InvenTrack</p>
              <p className="text-slate-500 text-[9px] mt-0.5 tracking-wide">Management Suite</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={13} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-thin space-y-0.5">
          <p className="section-label">Main Menu</p>
          {NAV.map(({ label, path, icon: Icon, color, addPath, addLabel }) => {
            const active = isActive(path);
            return (
              <div key={path} className="group/row flex items-center gap-1">
                <Link
                  to={path}
                  onClick={onClose}
                  className={`nav-item flex-1 min-w-0 group ${active ? "nav-item-active" : "nav-item-inactive"}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                    ${active ? "bg-brand-600/25" : "bg-white/5 group-hover:bg-white/8"} transition-colors`}>
                    <Icon size={14} className={active ? "text-brand-400" : color} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span className="flex-1 text-[13px] truncate">{label}</span>
                  {active && <ChevronRight size={12} className="text-brand-400 opacity-60 flex-shrink-0" />}
                </Link>

                {/* Quick-add "+" button — appears on hover */}
                {addPath && (
                  <button
                    onClick={(e) => handleAdd(e, addPath)}
                    title={addLabel ?? ""}
                    className="opacity-0 group-hover/row:opacity-100 flex-shrink-0 w-6 h-6 rounded-lg
                               bg-white/5 hover:bg-brand-600/30 hover:text-brand-300
                               flex items-center justify-center text-slate-500 transition-all duration-150"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>
            );
          })}

          <p className="section-label mt-5">System</p>
          <div className="nav-item nav-item-inactive opacity-40 cursor-not-allowed select-none">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <Zap size={14} className="text-amber-400" />
            </div>
            <span className="flex-1 text-[13px]">Analytics</span>
            <span className="text-[9px] bg-amber-400/15 text-amber-300 px-1.5 py-0.5 rounded-md font-medium">Soon</span>
          </div>
        </nav>

        {/* Quick-create strip */}
        <div className="px-2.5 pb-3 flex-shrink-0">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: "Product",  path: "/products/new",  color: "hover:bg-violet-600/20 hover:text-violet-300" },
              { label: "Customer", path: "/customers/new", color: "hover:bg-emerald-600/20 hover:text-emerald-300" },
              { label: "Order",    path: "/orders/new",    color: "hover:bg-amber-600/20 hover:text-amber-300" },
            ].map(({ label, path, color }) => (
              <button
                key={path}
                onClick={() => { onClose(); navigate(path); }}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 text-slate-500
                            text-[10px] font-medium transition-all duration-150 ${color}`}
              >
                <Plus size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* User card */}
        <div className="px-2.5 py-3 flex-shrink-0 border-t border-white/[0.05]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/8 transition-colors cursor-pointer">
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0a0f1e]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate leading-none">Admin User</p>
              <p className="text-slate-500 text-[10px] truncate mt-0.5">admin@inventrack.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
