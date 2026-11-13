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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Receivables Aging & Collections</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track unpaid balances categorized into 0-30, 31-60, 61-90, and 90+ day aging buckets
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500">Total Outstanding: </span>
          <span className="text-xl font-bold font-mono-num text-amber-800">
            {formatCurrency(totalOutstanding, company.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search debtor customer or invoice number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filtered.length} pending bill{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Aging Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice No</th>
                <th className="py-3 px-4 font-semibold">Customer / Debtor</th>
                <th className="py-3 px-4 font-semibold">Invoice Date</th>
                <th className="py-3 px-4 font-semibold">Age (Days)</th>
                <th className="py-3 px-4 font-semibold">Aging Bracket</th>
                <th className="py-3 px-4 font-semibold text-right">Invoice Value</th>
                <th className="py-3 px-4 font-semibold text-right">Received</th>
                <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No pending receivables! All issued bills have been settled.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td
                      onClick={() => onSelectInvoice(inv)}
                      className="py-3.5 px-4 font-mono font-bold text-emerald-800 cursor-pointer hover:underline"
                    >
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {inv.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {inv.daysOverdue} days
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.bucket === '0–30 days' ? 'bg-emerald-100 text-emerald-800' :
                        inv.bucket === '31–60 days' ? 'bg-amber-100 text-amber-800' :
                        inv.bucket === '61–90 days' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.bucket}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600">
                      {formatCurrency(inv.grandTotal, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600">
                      {formatCurrency(inv.amountReceived, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-amber-800">
                      {formatCurrency(inv.balanceDue, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenPayment(inv)}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-semibold text-xs border border-emerald-200 transition"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              Receive Payment
            </h4>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Invoice: <strong className="font-mono">{selectedInvoiceForPayment.invoiceNumber}</strong></div>
              <div>Customer: <strong>{selectedInvoiceForPayment.customerName}</strong></div>
              <div>Outstanding: <strong className="font-mono text-amber-700">{formatCurrency(selectedInvoiceForPayment.balanceDue, company.currencySymbol)}</strong></div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700">Amount Received ({company.currencySymbol})</label>
              <input
                type="number"
                step="any"
                max={selectedInvoiceForPayment.balanceDue}
                value={payAmount}
                onChange={e => setPayAmount(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedInvoiceForPayment(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPay}
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg"
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
