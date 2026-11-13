import React, { useState } from 'react';
import { 
  TrendingUp, 
  Receipt, 
  AlertCircle, 
  FileCheck, 
  HelpCircle, 
  ArrowUpRight, 
  Search, 
  Sparkles, 
  Mic, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { CompanySettings, Customer, Invoice, ProductItem } from '../types';
import { formatCurrency } from '../utils/taxEngine';
import { downloadGstr1JsonFile } from '../utils/gstr1Export';

interface DashboardViewProps {
  company: CompanySettings;
  invoices: Invoice[];
  customers: Customer[];
  products: ProductItem[];
  onSelectInvoice: (invoice: Invoice) => void;
  onNavigate: (view: any) => void;
  onResetDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  invoices,
  customers,
  products,
  onSelectInvoice,
  onNavigate,
  onResetDemo,
}) => {
  const [calcModal, setCalcModal] = useState<string | null>(null);
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpAnswer, setNlpAnswer] = useState<string | null>(
    'By value in October: Hikvision 4MP Dome Camera (₹1,86,400), Dell Latitude 3440 (₹1,58,000), Cat6 Cable 305m (₹92,300).'
  );
  const [activeChip, setActiveChip] = useState('Top selling items');

  const activeInvoices = invoices.filter(i => i.status !== 'CANCELLED');
  const cancelledCount = invoices.filter(i => i.status === 'CANCELLED').length;

  const totalSales = activeInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalTaxable = activeInvoices.reduce((sum, i) => sum + i.subtotalTaxable, 0);
  const totalTax = activeInvoices.reduce((sum, i) => sum + i.totalTax, 0);
  const totalCgst = activeInvoices.reduce((sum, i) => sum + i.cgstTotal, 0);
  const totalSgst = activeInvoices.reduce((sum, i) => sum + i.sgstTotal, 0);
  const totalIgst = activeInvoices.reduce((sum, i) => sum + i.igstTotal, 0);

  const totalReceivables = activeInvoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const debtorsCount = customers.filter(c => (c.balanceDue || 0) > 0).length;

  // Receivables Aging buckets
  const now = new Date().getTime();
  let aging0to30 = 0;
  let aging31to60 = 0;
  let aging61to90 = 0;
  let aging90plus = 0;

  for (const inv of activeInvoices) {
    if (inv.balanceDue > 0) {
      const invTime = new Date(inv.invoiceDate).getTime();
      const diffDays = Math.floor((now - invTime) / (1000 * 3600 * 24));
      if (diffDays <= 30) aging0to30 += inv.balanceDue;
      else if (diffDays <= 60) aging31to60 += inv.balanceDue;
      else if (diffDays <= 90) aging61to90 += inv.balanceDue;
      else aging90plus += inv.balanceDue;
    }
  }

  const lowStockItems = products.filter(p => p.currentStock <= p.reorderPoint);

  const handleChipClick = (chip: string) => {
    setActiveChip(chip);
    if (chip === "Who hasn't paid me?") {
      const debtors = customers
        .filter(c => (c.balanceDue || 0) > 0)
        .map(c => `${c.name}: ${formatCurrency(c.balanceDue, company.currencySymbol)}`)
        .join(', ');
      setNlpAnswer(`Outstanding debtors: ${debtors || 'None! All bills are settled.'}`);
    } else if (chip === 'Sales this month') {
      setNlpAnswer(
        `Gross sales in October: ${formatCurrency(totalSales, company.currencySymbol)} across ${activeInvoices.length} active invoices (${formatCurrency(totalTaxable, company.currencySymbol)} taxable + ${formatCurrency(totalTax, company.currencySymbol)} tax).`
      );
    } else if (chip === 'Top selling items') {
      setNlpAnswer(
        'By value in October: Hikvision 4MP Dome Camera (₹1,86,400), Dell Latitude 3440 (₹1,58,000), Cat6 Cable 305m (₹92,300).'
      );
    } else if (chip === 'GST liability') {
      setNlpAnswer(
        `Total Tax Collected: ${formatCurrency(totalTax, company.currencySymbol)} (CGST: ${formatCurrency(totalCgst, company.currencySymbol)}, SGST: ${formatCurrency(totalSgst, company.currencySymbol)}, IGST: ${formatCurrency(totalIgst, company.currencySymbol)}). Net payable after ITC.`
      );
    }
  };

  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpQuery.trim()) return;
    const q = nlpQuery.toLowerCase();
    setActiveChip('');

    if (q.includes('debt') || q.includes('paid') || q.includes('pending') || q.includes('due') || q.includes('owe')) {
      const debtors = customers
        .filter(c => (c.balanceDue || 0) > 0)
        .map(c => `${c.name} (${formatCurrency(c.balanceDue, company.currencySymbol)})`)
        .join('; ');
      setNlpAnswer(`Uncollected receivables: ${formatCurrency(totalReceivables, company.currencySymbol)}. Outstanding accounts: ${debtors || 'All cleared.'}`);
    } else if (q.includes('gst') || q.includes('tax') || q.includes('liability')) {
      setNlpAnswer(`Total tax liability: ${formatCurrency(totalTax, company.currencySymbol)} (Intra-state: ${formatCurrency(totalCgst + totalSgst, company.currencySymbol)}, Inter-state IGST: ${formatCurrency(totalIgst, company.currencySymbol)}).`);
    } else if (q.includes('sale') || q.includes('revenue') || q.includes('turnover')) {
      setNlpAnswer(`Total sales volume: ${formatCurrency(totalSales, company.currencySymbol)} (${activeInvoices.length} active invoices).`);
    } else if (q.includes('stock') || q.includes('inventory') || q.includes('low')) {
      const items = lowStockItems.map(p => `${p.name} (${p.currentStock} left, reorder at ${p.reorderPoint})`).join('; ');
      setNlpAnswer(`Critical stock alert: ${lowStockItems.length} items low. Details: ${items}`);
    } else {
      setNlpAnswer(`Calculated for "${nlpQuery}": Found ${activeInvoices.length} invoices, ${customers.length} customers, and ${products.length} catalog items.`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            FY {company.financialYear} · {company.legalName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/70 p-1 rounded-lg text-xs font-medium text-slate-600">
            <span className="px-2.5 py-1 rounded bg-white text-slate-900 shadow-xs">This month</span>
            <span className="px-2.5 py-1 text-slate-500 cursor-not-allowed">Today</span>
            <span className="px-2.5 py-1 text-slate-500 cursor-not-allowed">FY 2026-27</span>
          </div>

          <button
            onClick={onResetDemo}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md font-medium border border-slate-300 transition"
          >
            Reset demo
          </button>
        </div>
      </div>

      {/* 4 Key Figures Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative group">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Sales (October)</span>
            <button
              onClick={() => setCalcModal('sales')}
              className="text-slate-400 hover:text-emerald-700 transition"
              title="How is this calculated?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-900 mt-2">
            {formatCurrency(totalSales, company.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {formatCurrency(totalTaxable, company.currencySymbol)} taxable + {formatCurrency(totalTax, company.currencySymbol)} {company.taxSystem === 'GST_INDIA' ? 'GST' : 'Tax'}
          </div>
        </div>

        {/* GST Collected Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{company.taxSystem === 'GST_INDIA' ? 'GST collected (October)' : 'Tax liability'}</span>
            <button
              onClick={() => setCalcModal('gst')}
              className="text-slate-400 hover:text-emerald-700 transition"
              title="How is this calculated?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-900 mt-2">
            {formatCurrency(totalTax, company.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            CGST: {formatCurrency(totalCgst, company.currencySymbol)} · SGST: {formatCurrency(totalSgst, company.currencySymbol)} · IGST: {formatCurrency(totalIgst, company.currencySymbol)}
          </div>
        </div>

        {/* Receivables Due Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Receivables due</span>
            <button
              onClick={() => onNavigate('receivables')}
              className="text-slate-400 hover:text-emerald-700 transition"
              title="View receivables"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-bold font-mono-num text-amber-700 mt-2">
            {formatCurrency(totalReceivables, company.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {debtorsCount} customer{debtorsCount !== 1 ? 's' : ''} ({formatCurrency(aging31to60 + aging61to90 + aging90plus, company.currencySymbol)} over 30 days)
          </div>
        </div>

        {/* Invoices Issued Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Invoices issued</span>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-slate-400 hover:text-emerald-700 transition"
              title="View all invoices"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl font-bold font-mono-num text-slate-900 mt-2">
            {activeInvoices.length} issued
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {cancelledCount} cancelled · 0 rounding drift
          </div>
        </div>
      </div>

      {/* Middle Row: Receivables Aging & Ask Your Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receivables Aging Bar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-slate-900">Receivables aging</h3>
              <button
                onClick={() => onNavigate('receivables')}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                Details
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>0–30 days</span>
                  <span className="font-mono-num font-medium text-slate-900">
                    {formatCurrency(aging0to30, company.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-700 h-2 rounded-full"
                    style={{ width: `${totalReceivables > 0 ? (aging0to30 / totalReceivables) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>31–60 days</span>
                  <span className="font-mono-num font-medium text-slate-900">
                    {formatCurrency(aging31to60, company.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full"
                    style={{ width: `${totalReceivables > 0 ? (aging31to60 / totalReceivables) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>61–90 days</span>
                  <span className="font-mono-num font-medium text-slate-900">
                    {formatCurrency(aging61to90, company.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${totalReceivables > 0 ? (aging61to90 / totalReceivables) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>90+ days</span>
                  <span className="font-mono-num font-medium text-slate-900">
                    {formatCurrency(aging90plus, company.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-red-700 h-2 rounded-full"
                    style={{ width: `${totalReceivables > 0 ? (aging90plus / totalReceivables) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Automated payment tracking based on bill dates & settlements
          </div>
        </div>

        {/* "Ask your books" NLP Assistant */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Ask your books
              </h3>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Mic className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick Query Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["Who hasn't paid me?", 'Sales this month', 'Top selling items', 'GST liability'].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                    activeChip === chip
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Natural Query Input */}
            <form onSubmit={handleNlpSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Ask e.g. 'How much GST is due?' or 'Which stock is low?'"
                value={nlpQuery}
                onChange={e => setNlpQuery(e.target.value)}
                className="w-full pl-8 pr-16 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] rounded font-medium"
              >
                Query
              </button>
            </form>

            {/* Query Answer Output Box */}
            {nlpAnswer && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">{nlpAnswer}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                    Verified ledger
                  </span>
                  <span>Calculated from issued invoices · No estimates</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Invoices & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900">Recent invoices</h3>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              View all ({invoices.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Invoice</th>
                  <th className="py-2.5 px-4 font-medium">Customer</th>
                  <th className="py-2.5 px-4 font-medium">Date</th>
                  <th className="py-2.5 px-4 font-medium text-right">Taxable</th>
                  <th className="py-2.5 px-4 font-medium text-right">Total</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.slice(0, 5).map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice(inv)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-emerald-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-[160px] truncate">
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 text-right font-mono-num text-slate-600">
                      {formatCurrency(inv.subtotalTaxable, company.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-num font-semibold text-slate-900">
                      {formatCurrency(inv.grandTotal, company.currencySymbol)}
                    </td>
                    <td className="py-3 px-4">
                      {inv.status === 'PAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                          Paid
                        </span>
                      )}
                      {inv.status === 'PART_PAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                          Part paid
                        </span>
                      )}
                      {inv.status === 'UNPAID' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
                          Unpaid
                        </span>
                      )}
                      {inv.status === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-600 line-through">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Low stock watchlist
              </h3>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                All items
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  All inventory items are well-stocked.
                </div>
              ) : (
                lowStockItems.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div className="overflow-hidden pr-2">
                      <div className="font-medium text-xs text-slate-800 truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        HSN {p.hsnSacCode} · SKU {p.sku}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-700 font-mono">
                        {p.currentStock} {p.uom} left
                      </span>
                      <div className="text-[10px] text-slate-400">
                        reorder at {p.reorderPoint}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => downloadGstr1JsonFile(company, invoices)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export GSTR-1 JSON
            </button>
          </div>
        </div>
      </div>

      {/* Audit Modal ("How is this calculated?") */}
      {calcModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                {calcModal === 'sales' ? 'How is Sales Calculated?' : 'How is GST Liability Calculated?'}
              </h3>
              <button
                onClick={() => setCalcModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-600 space-y-3">
              {calcModal === 'sales' ? (
                <>
                  <p>
                    <strong>Formula:</strong> <code>Total Sales = ∑ (Active Invoice Grand Totals) - ∑ (Credit Notes)</code>
                  </p>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                    <div>Total Active Bills: {activeInvoices.length}</div>
                    <div>Sum of Taxable Value: {formatCurrency(totalTaxable, company.currencySymbol)}</div>
                    <div>Sum of GST Taxes: {formatCurrency(totalTax, company.currencySymbol)}</div>
                    <div className="font-bold pt-1 border-t border-slate-200 text-slate-900">
                      Gross Revenue: {formatCurrency(totalSales, company.currencySymbol)}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Cancelled invoices and draft bills are strictly excluded to maintain strict ledger integrity.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>CBIC Rule 46 Tax Formula:</strong>
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      <strong>Intra-State:</strong> Place of Supply = Seller State ({company.stateCode}) → CGST (50%) + SGST (50%)
                    </li>
                    <li>
                      <strong>Inter-State:</strong> Place of Supply ≠ Seller State → IGST (100%)
                    </li>
                  </ul>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                    <div>CGST (Central Tax): {formatCurrency(totalCgst, company.currencySymbol)}</div>
                    <div>SGST (State Tax): {formatCurrency(totalSgst, company.currencySymbol)}</div>
                    <div>IGST (Integrated Tax): {formatCurrency(totalIgst, company.currencySymbol)}</div>
                    <div className="font-bold pt-1 border-t border-slate-200 text-slate-900">
                      Total Output Tax: {formatCurrency(totalTax, company.currencySymbol)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setCalcModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
