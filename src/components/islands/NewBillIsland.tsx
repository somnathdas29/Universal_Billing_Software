import React, { useState } from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { NewBillView } from '../NewBillView';
import { InvoiceDetailModal } from '../InvoiceDetailModal';
import { Invoice } from '../../types';

export default function NewBillIsland() {
  const {
    company,
    customers,
    products,
    addInvoice,
    addCustomer,
    cancelInvoice,
    recordPayment,
  } = useBillingStorage();

  const [printedInvoice, setPrintedInvoice] = useState<Invoice | null>(null);

  const handleSave = (invoice: Invoice, printImmediately: boolean) => {
    addInvoice(invoice);
    if (printImmediately) {
      setPrintedInvoice(invoice);
      setTimeout(() => {
        window.print();
      }, 400);
    } else {
      window.location.href = '/invoices';
    }
  };

  return (
    <>
      <NewBillView
        company={company}
        customers={customers}
        products={products}
        onSaveInvoice={handleSave}
        onCancel={() => { window.location.href = '/dashboard'; }}
        onQuickAddCustomer={addCustomer}
      />

      {printedInvoice && (
        <InvoiceDetailModal
          invoice={printedInvoice}
          company={company}
          onClose={() => {
            setPrintedInvoice(null);
            window.location.href = '/invoices';
          }}
          onCancelInvoice={(id, reason) => {
            cancelInvoice(id, reason);
            setPrintedInvoice(null);
          }}
          onRecordPayment={(id, amount) => {
            recordPayment(id, amount);
            setPrintedInvoice(null);
          }}
        />
      )}
    </>
  );
}
