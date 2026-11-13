import React from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { Gstr1ReportView } from '../Gstr1ReportView';

export default function Gstr1Island() {
  const {
    company,
    invoices,
  } = useBillingStorage();

  return (
    <Gstr1ReportView
      company={company}
      invoices={invoices}
    />
  );
}
