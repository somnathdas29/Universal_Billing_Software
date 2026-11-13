import React from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { CreditNotesView } from '../CreditNotesView';

export default function CreditNotesIsland() {
  const {
    company,
    creditNotes,
  } = useBillingStorage();

  return (
    <CreditNotesView
      creditNotes={creditNotes}
      company={company}
    />
  );
}
