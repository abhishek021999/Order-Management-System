import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Menu, Search, Command, Plus, Zap, ChevronRight } from "lucide-react";
import SearchModal from "./SearchModal";
import NotificationsPanel from "./NotificationsPanel";

interface Props { onMenuClick: () => void; }
interface Crumb { label: string; path?: string; }

const buildBreadcrumbs = (pathname: string): Crumb[] => {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) return [{ label: "Dashboard" }];

  const SECTION: Record<string, string> = {
    products: "Products",
    customers: "Customers",
    orders: "Orders",
  };

  const crumbs: Crumb[] = [{ label: "Dashboard", path: "/" }];
  const section = segs[0];
  const sectionLabel = SECTION[section] ?? section;

  crumbs.push({ label: sectionLabel, path: `/${section}` });

  if (segs[1] === "new") {
    crumbs.push({ label: `New ${sectionLabel.replace(/s$/, "")}` });
  } else if (segs[1] && segs[2] === "edit") {
    crumbs.push({ label: `Edit ${sectionLabel.replace(/s$/, "")}` });
  } else if (segs[1] && /^\d+$/.test(segs[1])) {
    crumbs.push({ label: `Order #${segs[1]}` });
  }

  return crumbs;
};

interface QuickAction { label: string; path: string; icon: React.ReactNode; }

const QUICK_ACTIONS: Record<string, QuickAction> = {
  "/products":  { label: "Add Product",  path: "/products/new",  icon: <Plus size={13} /> },
  "/customers": { label: "Add Customer", path: "/customers/new", icon: <Plus size={13} /> },
  "/orders":    { label: "New Order",    path: "/orders/new",    icon: <Zap size={13} /> },
};

const Header: React.FC<Props> = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const crumbs = buildBreadcrumbs(pathname);
  const base = "/" + pathname.split("/")[1];
  const isListPage = pathname === base;
  const quickAction = isListPage ? QUICK_ACTIONS[base] : undefined;

  // Cmd+K / Ctrl+K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex-shrink-0">
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_0_0_rgb(0,0,0,0.03)]">
          <div className="flex items-center h-14 px-4 lg:px-6 gap-3">

            {/* Mobile menu */}
            <button onClick={onMenuClick} className="lg:hidden btn-icon text-slate-600" aria-label="Open menu">
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden lg:flex items-center gap-1 min-w-0">
              {crumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />}
                  {crumb.path && i < crumbs.length - 1 ? (
                    <Link
                      to={crumb.path}
                      className="text-[13px] text-slate-400 hover:text-slate-700 transition-colors font-medium truncate"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[13px] font-bold text-slate-900 truncate">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            {/* Quick-action button */}
            {quickAction && (
              <button
                onClick={() => navigate(quickAction.path)}
                className="hidden lg:inline-flex items-center gap-1.5 h-7 px-3 rounded-lg
                           bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold
                           transition-colors shadow-sm ml-2"
              >
                {quickAction.icon}
                {quickAction.label}
              </button>
            )}

            <div className="flex-1" />

            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2.5 h-8 px-3 bg-slate-100/80 hover:bg-slate-100
                         border border-slate-200/60 rounded-xl text-sm text-slate-400
                         hover:text-slate-600 transition-all duration-150 min-w-[180px]"
            >
              <Search size={13} className="text-slate-400 flex-shrink-0" />
              <span className="flex-1 text-left text-[12px]">Quick search…</span>
              <div className="hidden lg:flex items-center gap-0.5">
                <kbd className="inline-flex items-center h-4 px-1 rounded bg-white border border-slate-200 text-[9px] font-medium text-slate-400 shadow-sm">
                  <Command size={8} />
                </kbd>
                <kbd className="inline-flex items-center h-4 px-1 rounded bg-white border border-slate-200 text-[9px] font-medium text-slate-400 shadow-sm">
                  K
                </kbd>
              </div>
            </button>

            {/* Mobile search icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden btn-icon text-slate-500"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Notifications */}
            <NotificationsPanel />

            <div className="w-px h-5 bg-slate-200" />

            {/* User avatar */}
            <button className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-50 transition-colors">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-brand">
                  A
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">Admin</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Administrator</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Search modal — rendered outside header so it overlays everything */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
