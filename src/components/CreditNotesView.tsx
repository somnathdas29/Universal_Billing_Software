import React, { useState } from 'react';
import { 
  FileText, 
  RotateCcw, 
  Search, 
  ExternalLink 
} from 'lucide-react';
import { CreditNote, CompanySettings } from '../types';
import { formatCurrency } from '../utils/taxEngine';

interface CreditNotesViewProps {
  creditNotes: CreditNote[];
  company: CompanySettings;
}

export const CreditNotesView: React.FC<CreditNotesViewProps> = ({ creditNotes, company }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = creditNotes.filter(
    cn =>
      cn.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cn.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Credit Notes & Adjustments</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          Audited sales cancellations, goods return credits, and downward revisions
        </p>
      </div>

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search credit note number or customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Credit Note No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Against Invoice</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Taxable Credit</th>
                <th className="py-3 px-4 text-right">Tax Reversal</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No credit notes recorded. When an invoice is cancelled, a credit note is automatically logged here.
                  </td>
                </tr>
              ) : (
                filtered.map(cn => (
                  <tr key={cn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                      {cn.creditNoteNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{cn.date}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      {cn.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{cn.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 italic">{cn.reason}</td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600 dark:text-slate-300">
                      {formatCurrency(cn.taxableValue, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-600 dark:text-slate-300">
                      {formatCurrency(cn.taxAmount, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(cn.totalAmount, company.currencySymbol)}
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
