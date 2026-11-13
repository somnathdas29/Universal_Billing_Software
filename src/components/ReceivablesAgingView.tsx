import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { Customer, Invoice, CompanySettings } from '../types';
import { formatCurrency } from '../utils/taxEngine';

interface ReceivablesAgingViewProps {
  invoices: Invoice[];
  customers: Customer[];
  company: CompanySettings;
  onRecordPayment: (invoiceId: string, amount: number) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const ReceivablesAgingView: React.FC<ReceivablesAgingViewProps> = ({
  invoices,
  customers,
  company,
  onRecordPayment,
  onSelectInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  const activeInvoicesWithDue = invoices.filter(
    i => i.status !== 'CANCELLED' && i.balanceDue > 0
  );

  const now = new Date().getTime();

  const enrichedInvoices = activeInvoicesWithDue.map(inv => {
    const invDate = new Date(inv.invoiceDate).getTime();
    const daysOverdue = Math.max(0, Math.floor((now - invDate) / (1000 * 3600 * 24)));
    let bucket = '0–30 days';
    if (daysOverdue > 90) bucket = '90+ days';
    else if (daysOverdue > 60) bucket = '61–90 days';
    else if (daysOverdue > 30) bucket = '31–60 days';

    return {
      ...inv,
      daysOverdue,
      bucket,
    };
  });

  const filtered = enrichedInvoices.filter(i =>
    i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = enrichedInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoiceForPayment(inv);
    setPayAmount(inv.balanceDue);
  };

  const handleConfirmPay = () => {
    if (!selectedInvoiceForPayment || payAmount <= 0) return;
    onRecordPayment(selectedInvoiceForPayment.id, payAmount);
    setSelectedInvoiceForPayment(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Receivables Aging & Collections</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              Outstanding Debtors
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Track unpaid balances categorized into 0-30, 31-60, 61-90, and 90+ day aging buckets
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Outstanding: </span>
          <span className="text-xl sm:text-2xl font-extrabold font-mono-num text-amber-600 dark:text-amber-400">
            {formatCurrency(totalOutstanding, company.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search debtor customer or invoice number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing {filtered.length} pending bill{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Aging Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Customer / Debtor</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-4">Age (Days)</th>
                <th className="py-3 px-4">Aging Bracket</th>
                <th className="py-3 px-4 text-right">Invoice Value</th>
                <th className="py-3 px-4 text-right">Received</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No pending receivables! All issued bills have been settled.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td
                      onClick={() => onSelectInvoice(inv)}
                      className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer hover:underline"
                    >
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {inv.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {inv.daysOverdue} days
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.bucket === '0–30 days' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        inv.bucket === '31–60 days' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        inv.bucket === '61–90 days' ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800' :
                        'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                      }`}>
                        {inv.bucket}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600 dark:text-slate-300">
                      {formatCurrency(inv.grandTotal, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600 dark:text-slate-300">
                      {formatCurrency(inv.amountReceived, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(inv.balanceDue, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenPayment(inv)}
                        className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold text-xs border border-emerald-200 dark:border-emerald-800 transition shadow-2xs"
                      >
                        Receive
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Settlement Modal */}
      {selectedInvoiceForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Receive Payment
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>Invoice: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{selectedInvoiceForPayment.invoiceNumber}</strong></div>
              <div>Customer: <strong className="text-slate-900 dark:text-white">{selectedInvoiceForPayment.customerName}</strong></div>
              <div>Outstanding: <strong className="font-mono text-amber-600 dark:text-amber-400">{formatCurrency(selectedInvoiceForPayment.balanceDue, company.currencySymbol)}</strong></div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount Received ({company.currencySymbol})</label>
              <input
                type="number"
                step="any"
                max={selectedInvoiceForPayment.balanceDue}
                value={payAmount}
                onChange={e => setPayAmount(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3.5 py-2 text-sm font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Save Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
