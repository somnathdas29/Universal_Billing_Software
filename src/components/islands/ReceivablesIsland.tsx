import React, { useState } from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { ReceivablesAgingView } from '../ReceivablesAgingView';
import { InvoiceDetailModal } from '../InvoiceDetailModal';
import { Invoice } from '../../types';

export default function ReceivablesIsland() {
  const {
    company,
    invoices,
    customers,
    recordPayment,
    cancelInvoice,
  } = useBillingStorage();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <>
      <ReceivablesAgingView
        invoices={invoices}
        customers={customers}
        company={company}
        onRecordPayment={recordPayment}
        onSelectInvoice={inv => setSelectedInvoice(inv)}
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
