import React, { useState, useEffect } from 'react';
import { useBillingStorage } from './context/useBillingStorage';
import { Sidebar, NavView } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NewBillView } from './components/NewBillView';
import { InvoicesListView } from './components/InvoicesListView';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { InventoryView } from './components/InventoryView';
import { CustomersView } from './components/CustomersView';
import { Gstr1ReportView } from './components/Gstr1ReportView';
import { SettingsView } from './components/SettingsView';
import { ReceivablesAgingView } from './components/ReceivablesAgingView';
import { CreditNotesView } from './components/CreditNotesView';
import { GstToolsView } from './components/GstToolsView';
import { LandingPage } from './components/LandingPage';
import { ThemeToggle } from './components/ThemeToggle';
import { Invoice, Customer } from './types';
import { Menu, Plus } from 'lucide-react';

export function App() {
  const {
    company,
    setCompany,
    customers,
    products,
    invoices,
    creditNotes,
    addInvoice,
    cancelInvoice,
    recordPayment,
    addCustomer,
    updateCustomer,
    addProduct,
    updateProduct,
    resetToDemo,
    exportStateJson,
    importStateJson,
  } = useBillingStorage();

  const [currentView, setCurrentView] = useState<NavView>('landing');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global keyboard shortcut: Alt+N for New Bill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setSelectedInvoice(null);
        setCurrentView('new_bill');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveInvoice = (invoice: Invoice, printImmediately: boolean) => {
    addInvoice(invoice);
    if (printImmediately) {
      setSelectedInvoice(invoice);
      setTimeout(() => {
        window.print();
      }, 300);
    } else {
      setCurrentView('invoices');
    }
  };

  const handleNewBillForCustomer = (customer: Customer) => {
    setCurrentView('new_bill');
  };

  return (
    <div className="flex h-screen bg-[#f7f6f2] dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* If Landing Page view is active, render full-screen Landing Page */}
      {currentView === 'landing' ? (
        <div className="w-full h-screen overflow-y-auto">
          <LandingPage onStartBilling={() => setCurrentView('dashboard')} />
        </div>
      ) : (
        <>
          {/* Sidebar Navigation */}
          <Sidebar
            currentView={currentView}
            setCurrentView={(view) => {
              setSelectedInvoice(null);
              setCurrentView(view);
            }}
            company={company}
            invoices={invoices}
            products={products}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Top Responsive Mobile Header */}
            <header className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Mobile Home Return Button */}
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 transition group shadow-2xs"
                  title="Return to Home Landing Page"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span className="flex items-center gap-1 font-bold">Home</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle className="scale-90" />
                <button
                  onClick={() => {
                    setSelectedInvoice(null);
                    setCurrentView('new_bill');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New bill</span>
                </button>
              </div>
            </header>

            {/* Desktop Top Workspace Utility Bar */}
            <header className="hidden lg:flex items-center justify-between px-6 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 z-20 shrink-0">
              {/* Left: Home Return Button & Breadcrumbs */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:text-emerald-700 dark:hover:text-emerald-300 transition group shadow-2xs"
                  title="Return to PayzenMax Landing Page"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm group-hover:-translate-x-1 transition-transform">←</span>
                  <span className="font-bold">Back to Home</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  <span>PayzenMax</span>
                  <span>/</span>
                  <span className="text-slate-700 dark:text-slate-200 font-semibold capitalize">
                    {currentView.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Right: Offline Indicator & Fast Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% Offline Ready</span>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                <button
                  onClick={() => {
                    setSelectedInvoice(null);
                    setCurrentView('new_bill');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow-sm transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New bill</span>
                  <kbd className="text-[10px] bg-emerald-950/50 text-emerald-100 px-1 py-0.2 rounded font-mono ml-0.5">Alt+N</kbd>
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                company={company}
                invoices={invoices}
                customers={customers}
                products={products}
                onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                onNavigate={(view) => setCurrentView(view)}
                onResetDemo={resetToDemo}
              />
            )}

            {currentView === 'new_bill' && (
              <NewBillView
                company={company}
                customers={customers}
                products={products}
                onSaveInvoice={handleSaveInvoice}
                onCancel={() => setCurrentView('dashboard')}
                onQuickAddCustomer={addCustomer}
              />
            )}

            {currentView === 'invoices' && (
              <InvoicesListView
                invoices={invoices}
                company={company}
                onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                onNewBill={() => setCurrentView('new_bill')}
              />
            )}

            {currentView === 'credit_notes' && (
              <CreditNotesView
                creditNotes={creditNotes}
                company={company}
              />
            )}

            {currentView === 'customers' && (
              <CustomersView
                customers={customers}
                company={company}
                invoices={invoices}
                onAddCustomer={addCustomer}
                onUpdateCustomer={updateCustomer}
                onNewBillForCustomer={handleNewBillForCustomer}
              />
            )}

            {currentView === 'inventory' && (
              <InventoryView
                products={products}
                company={company}
                onAddProduct={addProduct}
                onUpdateProduct={updateProduct}
              />
            )}

            {currentView === 'gstr1' && (
              <Gstr1ReportView
                company={company}
                invoices={invoices}
              />
            )}

            {currentView === 'gst_tools' && (
              <GstToolsView
                company={company}
                invoices={invoices}
                onNavigate={(v) => setCurrentView(v)}
              />
            )}

            {currentView === 'sales_register' && (
              <InvoicesListView
                invoices={invoices}
                company={company}
                onSelectInvoice={(inv) => setSelectedInvoice(inv)}
                onNewBill={() => setCurrentView('new_bill')}
              />
            )}

            {currentView === 'receivables' && (
              <ReceivablesAgingView
                invoices={invoices}
                customers={customers}
                company={company}
                onRecordPayment={recordPayment}
                onSelectInvoice={(inv) => setSelectedInvoice(inv)}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                company={company}
                onUpdateCompany={setCompany}
                onExportBackup={exportStateJson}
                onImportBackup={importStateJson}
                onResetDemo={resetToDemo}
              />
            )}
          </main>
        </div>
      </>
      )}

      {/* Invoice Detail & CBIC Rule 46 Print Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          company={company}
          onClose={() => setSelectedInvoice(null)}
          onCancelInvoice={cancelInvoice}
          onRecordPayment={recordPayment}
        />
      )}
    </div>
  );
}
export default App;
