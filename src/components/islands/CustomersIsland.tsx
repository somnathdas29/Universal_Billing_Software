import React from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { CustomersView } from '../CustomersView';

export default function CustomersIsland() {
  const {
    company,
    customers,
    invoices,
    addCustomer,
    updateCustomer,
  } = useBillingStorage();

  return (
    <CustomersView
      customers={customers}
      company={company}
      invoices={invoices}
      onAddCustomer={addCustomer}
      onUpdateCustomer={updateCustomer}
      onNewBillForCustomer={() => { window.location.href = '/new-bill'; }}
    />
  );
}
