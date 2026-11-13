import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Truck, 
  Calculator, 
  BookOpen, 
  Percent, 
  Building2, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { COMMON_HSN_DIRECTORY, validateGstinChecksum } from '../utils/gstTools';
import { INDIAN_STATES, getStateFromGstin, formatCurrency } from '../utils/taxEngine';
import { CompanySettings, Invoice } from '../types';

interface GstToolsViewProps {
  company: CompanySettings;
  invoices: Invoice[];
  onNavigate: (view: any) => void;
}

export const GstToolsView: React.FC<GstToolsViewProps> = ({ company, invoices, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'validator' | 'hsn' | 'reverse_calc' | 'waybill_prep' | 'audit_check'>('validator');

  // Tool 1: GSTIN Validator State
  const [testGstin, setTestGstin] = useState('27AAJCV4821M1Z6');
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleValidateGstin = () => {
    const res = validateGstinChecksum(testGstin);
    const state = getStateFromGstin(testGstin);
    const pan = testGstin.length >= 10 ? testGstin.substring(2, 12) : null;
    setValidationResult({ ...res, state, pan, input: testGstin });
  };

  // Tool 2: HSN Search State
  const [hsnSearch, setHsnSearch] = useState('');
  const filteredHsn = COMMON_HSN_DIRECTORY.filter(h => 
    h.code.includes(hsnSearch) || 
    h.description.toLowerCase().includes(hsnSearch.toLowerCase()) ||
    h.category.toLowerCase().includes(hsnSearch.toLowerCase())
  );

  // Tool 3: Reverse GST Calculator (Extract GST from MRP)
  const [grossMrp, setGrossMrp] = useState<number>(1180);
  const [reverseRate, setReverseRate] = useState<number>(18);

  const reverseTaxable = grossMrp / (1 + reverseRate / 100);
  const reverseGstAmount = grossMrp - reverseTaxable;

  // Tool 4: E-Way Bill Readiness Inspector
  const ewayBillsEligible = invoices.filter(i => i.grandTotal >= 50000 && i.status !== 'CANCELLED');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Offline GST Toolkit</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              100% Offline · No Cloud Required
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            CBIC Rule 46 compliance utilities, Modulo-36 GSTIN checksum verification, HSN directory, reverse GST tax calculator, and E-Way bill threshold monitor
          </p>
        </div>
      </div>

      {/* Toolkit Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('validator')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'validator' ? 'bg-slate-900 dark:bg-emerald-700 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>GSTIN Checksum Validator</span>
        </button>

        <button
          onClick={() => setActiveTab('hsn')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'hsn' ? 'bg-slate-900 dark:bg-emerald-700 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>HSN / SAC Rate Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('reverse_calc')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'reverse_calc' ? 'bg-slate-900 dark:bg-emerald-700 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Reverse GST & MRP Extractor</span>
        </button>

        <button
          onClick={() => setActiveTab('waybill_prep')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'waybill_prep' ? 'bg-slate-900 dark:bg-emerald-700 text-white shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>E-Way Bill Threshold Inspector (≥₹50,000)</span>
        </button>
      </div>

      {/* Tab 1: GSTIN Checksum Validator */}
      {activeTab === 'validator' && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">CBIC Checksum Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Verify customer and vendor GSTINs offline using the official GSTN modulo-36 Luhn-variant checksum algorithm. Detects typos, misplaced state codes, and fake GST numbers immediately without internet connectivity.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              maxLength={15}
              placeholder="e.g. 27AAJCV4821M1Z6"
              value={testGstin}
              onChange={e => setTestGstin(e.target.value.toUpperCase())}
              className="flex-1 px-3.5 py-2 text-sm font-mono font-bold uppercase border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
            <button
              onClick={handleValidateGstin}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Verify Checksum
            </button>
          </div>

          {validationResult && (
            <div className={`p-5 rounded-2xl border space-y-3 max-w-xl animate-pop ${
              validationResult.valid
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-950 dark:text-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold text-sm">Valid Official GSTIN Format & Checksum</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-700 dark:text-red-400 shrink-0" />
                    <span className="font-bold text-sm">Invalid GSTIN ({validationResult.reason})</span>
                  </>
                )}
              </div>

              {validationResult.valid && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 font-mono">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Jurisdictional State:</span>
                    <strong className="text-slate-900 dark:text-white">{validationResult.state?.name || 'Unknown'} ({validationResult.state?.code})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Associated PAN:</span>
                    <strong className="text-slate-900 dark:text-white">{validationResult.pan}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Entity Code:</span>
                    <strong className="text-slate-900 dark:text-white">{testGstin.substring(12, 13)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Checksum Code:</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">{testGstin.substring(14)} (Verified)</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: HSN / SAC Rate Directory */}
      {activeTab === 'hsn' && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Offline HSN / SAC Code Finder</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quickly find 4-digit and 6-digit Harmonized System codes and standard GST tax slabs.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search HSN code, goods, or category..."
                value={hsnSearch}
                onChange={e => setHsnSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 bg-slate-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">HSN / SAC</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Standard GST Slab</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredHsn.map(item => (
                  <tr key={item.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'GOODS' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800' : 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">{item.category}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{item.gstRate}%</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-md">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reverse GST & MRP Calculator */}
      {activeTab === 'reverse_calc' && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Reverse GST & MRP Extractor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              When selling at an all-inclusive retail Maximum Retail Price (MRP), use this offline formula to strip out the exact base taxable price and the embedded GST portion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Inclusive Price / Total MRP ({company.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  value={grossMrp}
                  onChange={e => setGrossMrp(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Applicable GST Slab (%)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 12, 18, 28].map(slab => (
                    <button
                      key={slab}
                      type="button"
                      onClick={() => setReverseRate(slab)}
                      className={`py-2 rounded-xl font-mono text-xs font-bold border transition ${
                        reverseRate === slab
                          ? 'bg-slate-900 dark:bg-emerald-700 text-white border-slate-900 dark:border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {slab}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3.5 text-xs">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-700">
                Extracted Breakdown
              </div>

              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                <span>Base Taxable Price:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(reverseTaxable, company.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 text-emerald-800 dark:text-emerald-400">
                <span>Embedded GST Tax ({reverseRate}%):</span>
                <span className="font-mono font-bold">{formatCurrency(reverseGstAmount, company.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <span>CGST ({reverseRate / 2}%):</span>
                <span className="font-mono">{formatCurrency(reverseGstAmount / 2, company.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <span>SGST ({reverseRate / 2}%):</span>
                <span className="font-mono">{formatCurrency(reverseGstAmount / 2, company.currencySymbol)}</span>
              </div>

              <div className="pt-3 border-t-2 border-slate-900 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Inclusive Price:</span>
                <span className="font-mono text-emerald-800 dark:text-emerald-400 font-extrabold text-base">{formatCurrency(grossMrp, company.currencySymbol)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: E-Way Bill Readiness Inspector */}
      {activeTab === 'waybill_prep' && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-3xl space-y-1.5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              E-Way Bill Mandatory Threshold Watch (Rule 138)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Under GST Rule 138, generation of an E-Way Bill is mandatory prior to commencement of movement of goods where the consignment value exceeds <strong>₹50,000</strong>. PayzenMax automatically tracks all high-value invoices that require e-way bill documentation.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Recipient Customer</th>
                  <th className="py-3 px-4">Place of Supply</th>
                  <th className="py-3 px-4 text-right">Consignment Value</th>
                  <th className="py-3 px-4">E-Way Bill Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {ewayBillsEligible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No invoices currently exceed the ₹50,000 threshold.
                    </td>
                  </tr>
                ) : (
                  ewayBillsEligible.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">{inv.invoiceDate}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{inv.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{inv.placeOfSupply}</td>
                      <td className="py-3.5 px-4 text-right font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(inv.grandTotal, company.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Mandatory E-Way Bill Required (≥₹50k)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
