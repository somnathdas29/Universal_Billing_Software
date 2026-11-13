import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Globe2 
} from 'lucide-react';
import { CompanySettings, TaxSystem } from '../types';
import { INDIAN_STATES } from '../utils/taxEngine';

interface SettingsViewProps {
  company: CompanySettings;
  onUpdateCompany: (company: CompanySettings) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onResetDemo: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  onUpdateCompany,
  onExportBackup,
  onImportBackup,
  onResetDemo,
}) => {
  const [form, setForm] = useState<CompanySettings>(company);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to restore backup: Invalid JSON file');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Settings & Portability</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business profile, banking details, universal tax system, and local backups
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold">
          Settings updated successfully! All future invoices will use this configuration.
        </div>
      )}

      {importStatus && (
        <div className="p-3 bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-xs font-semibold">
          {importStatus}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Identity Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-emerald-700" />
            Business Identity & Tax Jurisdiction
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Legal Name (As on Certificate) *</label>
              <input
                type="text"
                required
                value={form.legalName}
                onChange={e => setForm({ ...form, legalName: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Trade / Display Name</label>
              <input
                type="text"
                value={form.tradeName}
                onChange={e => setForm({ ...form, tradeName: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Tax System Mode</label>
              <select
                value={form.taxSystem}
                onChange={e => {
                  const sys = e.target.value as TaxSystem;
                  setForm({
                    ...form,
                    taxSystem: sys,
                    taxNumberLabel: sys === 'GST_INDIA' ? 'GSTIN' : sys === 'VAT' ? 'VAT ID' : 'Tax ID',
                  });
                }}
                className="w-full mt-1 px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="GST_INDIA">India GST (CBIC Rule 46 CGST/SGST/IGST)</option>
                <option value="VAT">International Value Added Tax (VAT)</option>
                <option value="SALES_TAX">State / Regional Sales Tax</option>
                <option value="NO_TAX">No Tax (Exempt / Simple Invoicing)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">{form.taxNumberLabel} *</label>
              <input
                type="text"
                required
                value={form.taxNumber}
                onChange={e => setForm({ ...form, taxNumber: e.target.value.toUpperCase() })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Registered State & Code</label>
              <select
                value={form.stateCode}
                onChange={e => {
                  const st = INDIAN_STATES.find(s => s.code === e.target.value);
                  if (st) {
                    setForm({ ...form, stateCode: st.code, state: st.name });
                  }
                }}
                className="w-full mt-1 px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {INDIAN_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Currency Symbol</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={e => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Registered Business Address</label>
              <input
                type="text"
                value={form.addressLine1}
                onChange={e => setForm({ ...form, addressLine1: e.target.value })}
                placeholder="Unit, Floor, Building..."
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">City</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Pincode / Postal Code</label>
              <input
                type="text"
                value={form.pincode}
                onChange={e => setForm({ ...form, pincode: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Banking & UPI Settlement Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            Bank Settlement & Dynamic UPI QR
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={e => setForm({ ...form, bankName: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Bank Account Number</label>
              <input
                type="text"
                value={form.bankAccount}
                onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">IFSC Code / Routing</label>
              <input
                type="text"
                value={form.bankIfsc}
                onChange={e => setForm({ ...form, bankIfsc: e.target.value.toUpperCase() })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">UPI ID / VPA (For Dynamic QR)</label>
              <input
                type="text"
                placeholder="company@bank"
                value={form.upiId}
                onChange={e => setForm({ ...form, upiId: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Invoice Sequence & Terms */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Invoice Numbering & Legal Terms
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Invoice Prefix Series</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={e => setForm({ ...form, invoicePrefix: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Next Invoice Serial Number</label>
              <input
                type="number"
                value={form.nextInvoiceNumber}
                onChange={e => setForm({ ...form, nextInvoiceNumber: Number(e.target.value) || 1 })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Financial Year</label>
              <input
                type="text"
                value={form.financialYear}
                onChange={e => setForm({ ...form, financialYear: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-slate-700">Terms & Conditions Disclaimer</label>
              <textarea
                rows={3}
                value={form.termsAndConditions}
                onChange={e => setForm({ ...form, termsAndConditions: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            Save configuration
          </button>
        </div>
      </form>

      {/* Zero Lock-in Data Portability */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Zero-Lock-in Data Portability & Backup
        </h3>
        <p className="text-xs text-slate-600">
          All your invoices, customers, and inventory reside entirely inside your browser's private local storage. No server accounts, subscriptions, or remote lock-in.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onExportBackup}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-300 transition"
          >
            <Download className="w-4 h-4" />
            Download Full JSON Backup
          </button>

          <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-300 cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>Restore from JSON File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset database to clean sample data? All local edits will be refreshed.')) {
                onResetDemo();
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Sample Demo
          </button>
        </div>
      </div>
    </div>
  );
};
