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
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Credit Notes & Adjustments</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited sales cancellations, goods return credits, and downward revisions
        </p>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search credit note number or customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Credit Note No</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Against Invoice</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
                <th className="py-3 px-4 font-semibold text-right">Taxable Credit</th>
                <th className="py-3 px-4 font-semibold text-right">Tax Reversal</th>
                <th className="py-3 px-4 font-semibold text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No credit notes recorded. When an invoice is cancelled, a credit note is automatically logged here.
                  </td>
                </tr>
              ) : (
                filtered.map(cn => (
                  <tr key={cn.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-red-700">
                      {cn.creditNoteNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{cn.date}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 font-medium">
                      {cn.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{cn.customerName}</td>
                    <td className="py-3.5 px-4 text-slate-600 italic">{cn.reason}</td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-700">
                      {formatCurrency(cn.taxableValue, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-700">
                      {formatCurrency(cn.taxAmount, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-red-700">
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
