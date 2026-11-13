import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Users, 
  Package, 
  FileSpreadsheet, 
  BookOpen, 
  Clock, 
  Settings, 
  Plus, 
  CheckCircle2,
  Home,
  Wrench,
  X
} from 'lucide-react';
import { CompanySettings, Invoice, ProductItem } from '../types';
import { ThemeToggle } from './ThemeToggle';

export type NavView = 
  | 'landing'
  | 'dashboard' 
  | 'new_bill' 
  | 'invoices' 
  | 'credit_notes' 
  | 'customers' 
  | 'inventory' 
  | 'gstr1' 
  | 'gst_tools'
  | 'sales_register' 
  | 'receivables' 
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  setCurrentView: (view: NavView) => void;
  company: CompanySettings;
  invoices: Invoice[];
  products: ProductItem[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  company,
  invoices,
  products,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const lowStockCount = products.filter(p => p.currentStock <= p.reorderPoint).length;
  const activeInvoicesCount = invoices.filter(i => i.status !== 'CANCELLED').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: Receipt, badge: activeInvoicesCount },
    { id: 'credit_notes', label: 'Credit notes', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Items & stock', icon: Package, alertBadge: lowStockCount > 0 ? `${lowStockCount} low` : undefined },
  ];

  const reportItems = [
    { id: 'gstr1', label: company.taxSystem === 'GST_INDIA' ? 'GSTR-1' : 'Tax Return Summary', icon: FileSpreadsheet },
    { id: 'gst_tools', label: 'GST Toolkit (Offline)', icon: Wrench },
    { id: 'sales_register', label: 'Sales register', icon: BookOpen },
    { id: 'receivables', label: 'Receivables aging', icon: Clock },
  ];

  const handleNavClick = (view: NavView) => {
    setCurrentView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-white dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col h-full select-none shrink-0 no-print
        transition-all duration-300 ease-in-out shadow-lg lg:shadow-none
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Home Return Banner */}
        <div className="px-3 pt-3">
          <button
            onClick={() => handleNavClick('landing')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-emerald-800 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/50 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition group shadow-xs"
            title="Return to PayzenMax Landing Page"
          >
            <span className="flex items-center gap-2">
              <span className="p-1 rounded bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 group-hover:-translate-x-0.5 transition-transform shadow-xs">
                ←
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <Home className="w-3.5 h-3.5" />
                Home Page
              </span>
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider opacity-70 group-hover:opacity-100 transition">
              Landing
            </span>
          </button>
        </div>

        {/* Top Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 cursor-pointer group flex-1 overflow-hidden"
            title="Go to Landing Page"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm group-hover:bg-emerald-800 dark:group-hover:bg-emerald-500 transition shrink-0">
              PM
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate flex items-center gap-1.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                PayzenMax.com
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">Universal Billing</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle className="scale-90" />
            {onCloseMobile && (
              <button 
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* GSTIN / Business Meta Badge */}
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
          <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold truncate flex items-center justify-between">
            <span>{company.taxNumberLabel}: {company.taxNumber || 'Unregistered'}</span>
          </div>
          <div className="truncate text-slate-500 dark:text-slate-400 text-[10px]">
            {company.state} {company.stateCode ? `(${company.stateCode})` : ''} · FY {company.financialYear}
          </div>
        </div>

        {/* New Bill Primary CTA */}
        <div className="p-3">
          <button
            onClick={() => handleNavClick('new_bill')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg dark:shadow-emerald-950/40 transition active:scale-[0.98] border border-emerald-600/30"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New bill
            </span>
            <kbd className="text-[10px] bg-emerald-950/50 text-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold border border-emerald-500/20">
              Alt+N
            </kbd>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2 space-y-5 py-2 custom-scrollbar">
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Operations
            </div>
            <div className="space-y-0.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as NavView)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.alertBadge && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800/60">
                        {item.alertBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Reports & Tax
            </div>
            <div className="space-y-0.5">
              {reportItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as NavView)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              System
            </div>
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentView === 'settings'
                  ? 'bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className={`w-4 h-4 ${currentView === 'settings' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                Settings & backup
              </span>
            </button>
          </div>
        </div>

        {/* Offline Status Badge & Bottom Home Link */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80 space-y-2">
          <button
            onClick={() => handleNavClick('landing')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-md font-medium transition group"
          >
            <span className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-0.5 transition-transform font-bold">←</span>
              <Home className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
              <span>Back to Home</span>
            </span>
            <span className="text-[10px] text-slate-400">Exit</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Saved on device · Offline ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
