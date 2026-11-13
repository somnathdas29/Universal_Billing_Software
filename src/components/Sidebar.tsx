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
  Wrench
} from 'lucide-react';
import { CompanySettings, Invoice, ProductItem } from '../types';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  company,
  invoices,
  products,
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0 no-print">
      {/* Top Brand Header */}
      <div className="p-4 border-b border-slate-100">
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm group-hover:bg-emerald-800 transition">
            PM
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-tight text-slate-900 truncate flex items-center gap-1.5 group-hover:text-emerald-800 transition">
              PayzenMax.com
            </h1>
            <p className="text-[11px] text-slate-500 truncate">Universal Billing Platform</p>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-0.5">
          <div className="font-mono text-slate-700 font-medium truncate">
            {company.taxNumberLabel}: {company.taxNumber || 'Unregistered'}
          </div>
          <div className="truncate">
            {company.state} {company.stateCode ? `(${company.stateCode})` : ''} · FY {company.financialYear}
          </div>
        </div>
      </div>

      {/* New Bill Primary CTA */}
      <div className="p-3">
        <button
          onClick={() => setCurrentView('new_bill')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm rounded-lg shadow-sm transition active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New bill
          </span>
          <kbd className="text-[10px] bg-emerald-950/40 text-emerald-100 px-1.5 py-0.5 rounded font-mono">
            Alt+N
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 space-y-6 py-2">
        <div>
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations
          </div>
          <div className="space-y-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as NavView)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.alertBadge && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                      {item.alertBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Reports & Tax
          </div>
          <div className="space-y-0.5">
            {reportItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as NavView)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            System
          </div>
          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition ${
              currentView === 'settings'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings className={`w-4 h-4 ${currentView === 'settings' ? 'text-emerald-700' : 'text-slate-400'}`} />
              Settings & backup
            </span>
          </button>
        </div>
      </div>

      {/* Offline Status Badge */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-2">
        <button
          onClick={() => setCurrentView('landing')}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded font-medium transition"
        >
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>View Landing Page</span>
        </button>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">Saved on device · Offline</span>
        </div>
      </div>
    </aside>
  );
};
