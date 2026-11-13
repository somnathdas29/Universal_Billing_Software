import React from 'react';
import { useBillingStorage } from '../../context/useBillingStorage';
import { SettingsView } from '../SettingsView';

export default function SettingsIsland() {
  const {
    company,
    setCompany,
    exportStateJson,
    importStateJson,
    resetToDemo,
  } = useBillingStorage();

  return (
    <SettingsView
      company={company}
      onUpdateCompany={setCompany}
      onExportBackup={exportStateJson}
      onImportBackup={importStateJson}
      onResetDemo={resetToDemo}
    />
  );
}
