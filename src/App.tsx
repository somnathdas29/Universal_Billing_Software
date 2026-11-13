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
            <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -ml-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                    PM
                  </div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">PayzenMax</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle className="scale-90" />
                <button
                  onClick={() => {
                    setSelectedInvoice(null);
                    setCurrentView('new_bill');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New bill</span>
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
