import React, { useState } from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { DashboardView } from '../DashboardView';
import { InvoiceDetailModal } from '../InvoiceDetailModal';
import { Invoice } from '../../types';

export default function DashboardIsland() {
  const {
    company,
    invoices,
    customers,
    products,
    cancelInvoice,
    recordPayment,
    resetToDemo,
  } = useBillingStorage();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleNavigate = (view: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/dashboard',
      new_bill: '/new-bill',
      invoices: '/invoices',
      receivables: '/receivables',
      inventory: '/inventory',
      customers: '/customers',
      gst_tools: '/gst-tools',
      gstr1: '/gstr1',
      settings: '/settings',
    };
    if (routeMap[view]) {
      window.location.href = routeMap[view];
    }
  };

  return (
    <>
      <DashboardView
        company={company}
        invoices={invoices}
        customers={customers}
        products={products}
        onSelectInvoice={inv => setSelectedInvoice(inv)}
        onNavigate={handleNavigate}
        onResetDemo={resetToDemo}
      />

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          company={company}
          onClose={() => setSelectedInvoice(null)}
          onCancelInvoice={(id, reason) => {
            cancelInvoice(id, reason);
            setSelectedInvoice(null);
          }}
          onRecordPayment={(id, amount) => {
            recordPayment(id, amount);
            setSelectedInvoice(null);
          }}
        />
      )}
    </>
  );
}
