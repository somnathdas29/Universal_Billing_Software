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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Offline GST Toolkit</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              100% Offline · No Cloud Required
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            CBIC Rule 46 compliance utilities, GSTIN checksum verification, HSN directory, reverse GST tax calculator, and audit checkers
          </p>
        </div>
      </div>

      {/* Toolkit Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('validator')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'validator' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>GSTIN Checksum Validator</span>
        </button>

        <button
          onClick={() => setActiveTab('hsn')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'hsn' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>HSN / SAC Rate Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('reverse_calc')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'reverse_calc' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Reverse GST & MRP Extractor</span>
        </button>

        <button
          onClick={() => setActiveTab('waybill_prep')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'waybill_prep' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>E-Way Bill Threshold Inspector (≥₹50,000)</span>
        </button>
      </div>

      {/* Tab 1: GSTIN Checksum Validator */}
      {activeTab === 'validator' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="font-bold text-base text-slate-900">CBIC Checksum Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
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
              className="flex-1 px-3.5 py-2 text-sm font-mono font-bold uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <button
              onClick={handleValidateGstin}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs transition"
            >
              Verify Checksum
            </button>
          </div>

          {validationResult && (
            <div className={`p-5 rounded-xl border space-y-3 max-w-xl animate-pop ${
              validationResult.valid ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'
            }`}>
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span className="font-bold text-sm">Valid Official GSTIN Format & Checksum</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-700 shrink-0" />
                    <span className="font-bold text-sm">Invalid GSTIN ({validationResult.reason})</span>
                  </>
                )}
              </div>

              {validationResult.valid && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200/60 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Jurisdictional State:</span>
                    <strong>{validationResult.state?.name || 'Unknown'} ({validationResult.state?.code})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Associated PAN:</span>
                    <strong>{validationResult.pan}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Entity Code:</span>
                    <strong>{testGstin.substring(12, 13)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Checksum Code:</span>
                    <strong>{testGstin.substring(14)} (Verified)</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: HSN / SAC Rate Directory */}
      {activeTab === 'hsn' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Offline HSN / SAC Code Finder</h3>
              <p className="text-xs text-slate-500">Quickly find 4-digit and 6-digit Harmonized System codes and standard GST tax slabs.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search HSN code, goods, or category..."
                value={hsnSearch}
                onChange={e => setHsnSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">HSN / SAC</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold">Standard GST Slab</th>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHsn.map(item => (
                  <tr key={item.code} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 text-sm">
                      {item.code}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.type === 'GOODS' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{item.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.gstRate}%</td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reverse GST & MRP Calculator */}
      {activeTab === 'reverse_calc' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <h3 className="font-bold text-base text-slate-900">Reverse GST & MRP Extractor</h3>
            <p className="text-xs text-slate-600">
              When selling at an all-inclusive retail Maximum Retail Price (MRP), use this offline formula to strip out the exact base taxable price and the embedded GST portion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Inclusive Price / Total MRP ({company.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  value={grossMrp}
                  onChange={e => setGrossMrp(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Applicable GST Slab (%)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 12, 18, 28].map(slab => (
                    <button
                      key={slab}
                      type="button"
                      onClick={() => setReverseRate(slab)}
                      className={`py-2 rounded-lg font-mono text-xs font-bold border transition ${
                        reverseRate === slab ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {slab}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
                Extracted Breakdown
              </div>

              <div className="flex justify-between py-1 text-slate-600">
                <span>Base Taxable Price:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(reverseTaxable, company.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 text-emerald-800">
                <span>Embedded GST Tax ({reverseRate}%):</span>
                <span className="font-mono font-bold">{formatCurrency(reverseGstAmount, company.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-500 text-[11px]">
                <span>CGST ({reverseRate / 2}%):</span>
                <span className="font-mono">{formatCurrency(reverseGstAmount / 2, company.currencySymbol)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-500 text-[11px]">
                <span>SGST ({reverseRate / 2}%):</span>
                <span className="font-mono">{formatCurrency(reverseGstAmount / 2, company.currencySymbol)}</span>
              </div>

              <div className="pt-3 border-t-2 border-slate-900 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Inclusive Price:</span>
                <span className="font-mono text-emerald-900">{formatCurrency(grossMrp, company.currencySymbol)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: E-Way Bill Readiness Inspector */}
      {activeTab === 'waybill_prep' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-3xl space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-800" />
              E-Way Bill Mandatory Threshold Watch (Rule 138)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under GST Rule 138, generation of an E-Way Bill is mandatory prior to commencement of movement of goods where the consignment value exceeds <strong>₹50,000</strong>. PayzenMax automatically tracks all high-value invoices that require e-way bill documentation.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Invoice No</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Recipient Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Place of Supply</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Consignment Value</th>
                  <th className="py-2.5 px-4 font-semibold">E-Way Bill Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ewayBillsEligible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No invoices currently exceed the ₹50,000 threshold.
                    </td>
                  </tr>
                ) : (
                  ewayBillsEligible.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{inv.invoiceDate}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.customerName}</td>
                      <td className="py-3 px-4">{inv.placeOfSupply}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                        {formatCurrency(inv.grandTotal, company.currencySymbol)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
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
