import React, { useState } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  Plus, 
  Receipt, 
  Filter 
} from 'lucide-react';
import { CompanySettings, Invoice } from '../types';
import { formatCurrency } from '../utils/taxEngine';

interface InvoicesListViewProps {
  invoices: Invoice[];
  company: CompanySettings;
  onSelectInvoice: (invoice: Invoice) => void;
  onNewBill: () => void;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  invoices,
  company,
  onSelectInvoice,
  onNewBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PART_PAID' | 'UNPAID' | 'CANCELLED'>('ALL');

  const filtered = invoices.filter(inv => {
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.items.some(it => it.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCsv = () => {
    const headers = ['Invoice No', 'Date', 'Customer', 'GSTIN', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total', 'Received', 'Balance', 'Status', 'Payment Mode'];
    const rows = filtered.map(inv => [
      inv.invoiceNumber,
      inv.invoiceDate,
      `"${inv.customerName}"`,
      inv.customerTaxNumber || '',
      inv.subtotalTaxable.toFixed(2),
      inv.cgstTotal.toFixed(2),
      inv.sgstTotal.toFixed(2),
      inv.igstTotal.toFixed(2),
      inv.grandTotal.toFixed(2),
      inv.amountReceived.toFixed(2),
      inv.balanceDue.toFixed(2),
      inv.status,
      inv.paymentMode,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Tax Invoices</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
              {filtered.length} Invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Audit-ready sales register · CBIC Rule 46 Compliant
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={onNewBill}
            className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg dark:shadow-emerald-950/50 transition border border-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            New bill
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search invoice number, customer, SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'PAID', 'PART_PAID', 'UNPAID', 'CANCELLED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer / Buyer</th>
                <th className="py-3 px-4">POS</th>
                <th className="py-3 px-4 text-right">Taxable ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-right">GST ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-right">Grand Total ({company.currencySymbol})</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No invoices match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      <div>{inv.customerName}</div>
                      {inv.customerTaxNumber && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {inv.customerTaxNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                      {inv.placeOfSupplyCode}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600 dark:text-slate-300 font-medium">
                      {formatCurrency(inv.subtotalTaxable, '')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600 dark:text-slate-300 font-medium">
                      {formatCurrency(inv.totalTax, '')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.grandTotal, '')}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono-num font-semibold ${
                      inv.balanceDue > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {inv.balanceDue > 0 ? formatCurrency(inv.balanceDue, '') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {inv.status === 'PAID' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          PAID
                        </span>
                      )}
                      {inv.status === 'PART_PAID' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          PART PAID
                        </span>
                      )}
                      {inv.status === 'UNPAID' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                          UNPAID
                        </span>
                      )}
                      {inv.status === 'CANCELLED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 line-through">
                          CANCELLED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
