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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tax Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready sales register · CBIC Rule 46 Compliant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Export CSV
          </button>
          <button
            onClick={onNewBill}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            New bill
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search invoice number, customer, SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'PAID', 'PART_PAID', 'UNPAID', 'CANCELLED'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice No</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Customer / Buyer</th>
                <th className="py-3 px-4 font-semibold">POS</th>
                <th className="py-3 px-4 font-semibold text-right">Taxable ({company.currencySymbol})</th>
                <th className="py-3 px-4 font-semibold text-right">GST ({company.currencySymbol})</th>
                <th className="py-3 px-4 font-semibold text-right">Grand Total ({company.currencySymbol})</th>
                <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No invoices match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                      <div>{inv.customerName}</div>
                      {inv.customerTaxNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inv.customerTaxNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {inv.placeOfSupplyCode}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600">
                      {formatCurrency(inv.subtotalTaxable, '')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600">
                      {formatCurrency(inv.totalTax, '')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal, '')}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono-num font-semibold ${
                      inv.balanceDue > 0 ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      {inv.balanceDue > 0 ? formatCurrency(inv.balanceDue, '') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {inv.status === 'PAID' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          PAID
                        </span>
                      )}
                      {inv.status === 'PART_PAID' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          PART PAID
                        </span>
                      )}
                      {inv.status === 'UNPAID' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          UNPAID
                        </span>
                      )}
                      {inv.status === 'CANCELLED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 line-through">
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
