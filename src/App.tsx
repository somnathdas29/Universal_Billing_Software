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
import { Invoice, Customer } from './types';

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
    <div className="flex h-screen bg-[#f7f6f2] overflow-hidden text-slate-900">
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
          />

          {/* Main Content Area */}
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
