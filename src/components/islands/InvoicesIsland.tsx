import React, { useState } from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { InvoicesListView } from '../InvoicesListView';
import { InvoiceDetailModal } from '../InvoiceDetailModal';
import { Invoice } from '../../types';

export default function InvoicesIsland() {
  const {
    company,
    invoices,
    cancelInvoice,
    recordPayment,
  } = useBillingStorage();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <>
      <InvoicesListView
        invoices={invoices}
        company={company}
        onSelectInvoice={inv => setSelectedInvoice(inv)}
        onNewBill={() => { window.location.href = '/new-bill'; }}
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
