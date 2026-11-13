import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck 
} from 'lucide-react';
import { CompanySettings, Invoice } from '../types';
import { formatCurrency } from '../utils/taxEngine';
import { generateGstr1Json, downloadGstr1JsonFile } from '../utils/gstr1Export';

interface Gstr1ReportViewProps {
  company: CompanySettings;
  invoices: Invoice[];
}

export const Gstr1ReportView: React.FC<Gstr1ReportViewProps> = ({ company, invoices }) => {
  const gstr1Data = generateGstr1Json(company, invoices);

  const b2bInvoices = invoices.filter(
    i => i.status !== 'CANCELLED' && i.customerTaxNumber && i.customerTaxNumber.trim().length >= 10
  );
  const b2csInvoices = invoices.filter(
    i => i.status !== 'CANCELLED' && (!i.customerTaxNumber || i.customerTaxNumber.trim().length < 10)
  );

  const totalB2bTaxable = b2bInvoices.reduce((sum, i) => sum + i.subtotalTaxable, 0);
  const totalB2bTax = b2bInvoices.reduce((sum, i) => sum + i.totalTax, 0);

  const totalB2csTaxable = b2csInvoices.reduce((sum, i) => sum + i.subtotalTaxable, 0);
  const totalB2csTax = b2csInvoices.reduce((sum, i) => sum + i.totalTax, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">GSTR-1 Monthly Return Filing</h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-xs border border-emerald-300 dark:border-emerald-700">
              Direct GSTN Schema
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Auto-categorized into CBIC GSTR-1 Portal Tables · 100% Client-Side Compiler
          </p>
        </div>

        <button
          onClick={() => downloadGstr1JsonFile(company, invoices)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg dark:shadow-emerald-950/50 transition border border-emerald-600/30"
        >
          <Download className="w-4 h-4" />
          Download GSTR-1 JSON File
        </button>
      </div>

      {/* Compliance Callout Banner */}
      <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 dark:text-emerald-200 space-y-0.5 font-medium">
          <span className="font-bold">Zero-Lockin GSTR-1 Export:</span> The generated JSON strictly adheres to the official GST Portal offline utility schema. You or your Chartered Accountant can upload this file directly on <strong>gst.gov.in → Returns Dashboard → GSTR-1 → Prepare Offline</strong> without any third-party software.
        </div>
      </div>

      {/* Table 4: B2B Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono">
                Table 4
              </span>
              Taxable Outward Supplies to Registered Persons (B2B)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Includes regular taxable supplies made to GSTIN-registered businesses
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500">Taxable: </span>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(totalB2bTaxable, company.currencySymbol)}
            </span>
            <span className="text-slate-500 ml-3">Tax: </span>
            <span className="font-mono font-bold text-emerald-800">
              {formatCurrency(totalB2bTax, company.currencySymbol)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Receiver GSTIN</th>
                <th className="py-2.5 px-4 font-semibold">Buyer Name</th>
                <th className="py-2.5 px-4 font-semibold">Invoice No</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold text-right">Invoice Value</th>
                <th className="py-2.5 px-4 font-semibold text-right">Taxable Value</th>
                <th className="py-2.5 px-4 font-semibold text-right">Tax Amount</th>
                <th className="py-2.5 px-4 font-semibold text-center">Reverse Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {b2bInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {inv.customerTaxNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{inv.customerName}</td>
                  <td className="py-3 px-4 font-mono text-emerald-800 font-medium">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{inv.invoiceDate}</td>
                  <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-900">
                    {formatCurrency(inv.grandTotal, '')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num text-slate-700">
                    {formatCurrency(inv.subtotalTaxable, '')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-900">
                    {formatCurrency(inv.totalTax, '')}
                  </td>
                  <td className="py-3 px-4 text-center text-[10px] font-mono">
                    {inv.reverseCharge ? 'Y' : 'N'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 7: B2C (Small) Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono">
                Table 7
              </span>
              Taxable Outward Supplies to Unregistered Persons (B2C Small)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Net of debit & credit notes, grouped by Place of Supply and Rate
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500">Taxable: </span>
            <span className="font-mono font-bold text-slate-900">
              {formatCurrency(totalB2csTaxable, company.currencySymbol)}
            </span>
            <span className="text-slate-500 ml-3">Tax: </span>
            <span className="font-mono font-bold text-emerald-800">
              {formatCurrency(totalB2csTax, company.currencySymbol)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Supply Type</th>
                <th className="py-2.5 px-4 font-semibold">Place of Supply (POS)</th>
                <th className="py-2.5 px-4 font-semibold text-center">Rate</th>
                <th className="py-2.5 px-4 font-semibold text-right">Taxable Value</th>
                <th className="py-2.5 px-4 font-semibold text-right">Integrated Tax (IGST)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Central Tax (CGST)</th>
                <th className="py-2.5 px-4 font-semibold text-right">State Tax (SGST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gstr1Data.b2cs.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {row.sply_ty}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800">{row.pos}</td>
                  <td className="py-3 px-4 font-mono text-center font-bold">{row.rt}%</td>
                  <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-900">
                    {formatCurrency(row.txval, '')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num text-slate-600">
                    {formatCurrency(row.iamt, '')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num text-slate-600">
                    {formatCurrency(row.camt, '')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num text-slate-600">
                    {formatCurrency(row.samt, '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 12: HSN Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono">
              Table 12
            </span>
            HSN-Wise Summary of Outward Supplies
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Aggregated by 4-digit/6-digit Harmonized System of Nomenclature code
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">HSN Code</th>
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-4 font-semibold text-center">UQC</th>
                <th className="py-2.5 px-4 font-semibold text-right">Total Qty</th>
                <th className="py-2.5 px-4 font-semibold text-right">Total Value</th>
                <th className="py-2.5 px-4 font-semibold text-right">Taxable Value</th>
                <th className="py-2.5 px-4 font-semibold text-right">Total Tax Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gstr1Data.hsn.data.map(item => (
                <tr key={item.num} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {item.hsn_sc}
                  </td>
                  <td className="py-3 px-4 text-slate-800">{item.desc}</td>
                  <td className="py-3 px-4 font-mono text-center text-[10px] text-slate-500">
                    {item.uqc}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num font-bold text-slate-900">
                    {item.qty}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num text-slate-700">
                    {formatCurrency(item.val, '')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-900">
                    {formatCurrency(item.txval, '')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-num font-bold text-emerald-800">
                    {formatCurrency(item.iamt + item.camt + item.samt, '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
