import React from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { GstToolsView } from '../GstToolsView';

export default function GstToolsIsland() {
  const {
    company,
    invoices,
  } = useBillingStorage();

  const handleNavigate = (view: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/dashboard',
      new_bill: '/new-bill',
      invoices: '/invoices',
      receivables: '/receivables',
    };
    if (routeMap[view]) {
      window.location.href = routeMap[view];
    }
  };

  return (
    <GstToolsView
      company={company}
      invoices={invoices}
      onNavigate={handleNavigate}
    />
  );
}
