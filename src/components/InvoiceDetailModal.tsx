import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  Ban, 
  ArrowLeft, 
  X,
  CheckCircle, 
  QrCode, 
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CompanySettings, Invoice } from '../types';
import { formatCurrency, numberToWordsIndian, generateUpiUrl } from '../utils/taxEngine';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  company: CompanySettings;
  onClose: () => void;
  onCancelInvoice: (invoiceId: string, reason: string) => void;
  onRecordPayment: (invoiceId: string, amount: number) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  company,
  onClose,
  onCancelInvoice,
  onRecordPayment,
}) => {
  const [activeCopy, setActiveCopy] = useState<'Original' | 'Duplicate' | 'Triplicate'>('Original');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(invoice.balanceDue);

  // Close on Escape key & freeze body scroll while modal is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCancelPrompt) {
          setShowCancelPrompt(false);
        } else if (showPaymentPrompt) {
          setShowPaymentPrompt(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [showCancelPrompt, showPaymentPrompt, onClose]);

  const upiPayUrl = generateUpiUrl({
    upiId: company.upiId,
    payeeName: company.tradeName || company.legalName,
    amount: invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal,
    invoiceNumber: invoice.invoiceNumber,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsapp = () => {
    const text = `Invoice from ${company.tradeName || company.legalName}\nInvoice No: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.grandTotal, company.currencySymbol)}\nBalance Due: ${formatCurrency(invoice.balanceDue, company.currencySymbol)}\nDate: ${invoice.invoiceDate}\nThank you for your business!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      alert('Please specify a reason for cancellation');
      return;
    }
    onCancelInvoice(invoice.id, cancelReason);
    setShowCancelPrompt(false);
    onClose();
  };

  const handleConfirmPayment = () => {
    if (payAmount <= 0) return;
    onRecordPayment(invoice.id, payAmount);
    setShowPaymentPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md transition-all">
      {/* Modal Dialog Card */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 max-w-5xl w-full h-[94vh] max-h-[94vh] flex flex-col overflow-hidden animate-pop"
        role="dialog"
        aria-modal="true"
      >
        {/* Fixed Pinned Header Toolbar (Never scrolls off) */}
        <header className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800 no-print z-20 shadow-sm">
          {/* Left: Close/Back & Invoice Identifiers */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition group flex items-center gap-1.5 text-xs font-semibold active:scale-95"
              title="Close (Esc)"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-wide font-mono text-emerald-400">
                {invoice.invoiceNumber}
              </span>
              <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                invoice.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                invoice.status === 'PART_PAID' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                invoice.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 
                'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  invoice.status === 'PAID' ? 'bg-emerald-400 animate-pulse' :
                  invoice.status === 'PART_PAID' ? 'bg-amber-400' :
                  invoice.status === 'CANCELLED' ? 'bg-red-400' : 'bg-slate-400'
                }`} />
                {invoice.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Center: Copy Designation Selector */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs">
            {(['Original', 'Duplicate', 'Triplicate'] as const).map(copy => (
              <button
                key={copy}
                onClick={() => setActiveCopy(copy)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition duration-150 ${
                  activeCopy === copy 
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                {copy}
              </button>
            ))}
          </div>

          {/* Right: Actions & Close X */}
          <div className="flex items-center gap-2">
            {invoice.status !== 'CANCELLED' && invoice.balanceDue > 0 && (
              <button
                onClick={() => setShowPaymentPrompt(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-semibold transition active:scale-95 shadow-sm"
              >
                Receive payment
              </button>
            )}

            <button
              onClick={handleShareWhatsapp}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs rounded-xl transition active:scale-95"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Print</span>
            </button>

            {invoice.status !== 'CANCELLED' && (
              <button
                onClick={() => setShowCancelPrompt(true)}
                className="p-2 bg-red-950/50 hover:bg-red-900/70 text-red-300 hover:text-white rounded-xl transition active:scale-95"
                title="Cancel Invoice & Issue Credit Note"
              >
                <Ban className="w-4 h-4" />
              </button>
            )}

            <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Document Canvas (with comfortable padded margins) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-100 dark:bg-slate-950/70">
          <div className="max-w-4xl mx-auto">
            {/* Printable CBIC Rule 46 Tax Invoice Paper Sheet */}
            <div 
              id="printable-invoice" 
              className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl ring-1 ring-slate-900/5 text-xs space-y-6"
            >
              {/* Header & Copy Type */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mb-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    CBIC Rule 46 Tax Invoice
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight !text-slate-900">
                    {company.legalName}
                  </h1>
                  {company.tradeName && (
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">({company.tradeName})</div>
                  )}
                  <div className="text-slate-600 mt-1.5 max-w-sm text-xs leading-relaxed">
                    {company.addressLine1}, {company.addressLine2 ? `${company.addressLine2}, ` : ''}
                    {company.city}, {company.state} - {company.pincode}
                  </div>
                  <div className="mt-2 font-mono text-[11px] text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/80 inline-block">
                    <strong className="text-slate-600">{company.taxNumberLabel}:</strong> <span className="font-bold text-emerald-800">{company.taxNumber}</span> · <strong className="text-slate-600">State Code:</strong> {company.stateCode}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Phone: {company.phone} · Email: {company.email}
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    {activeCopy} for {activeCopy === 'Original' ? 'Recipient' : activeCopy === 'Duplicate' ? 'Transporter' : 'Supplier'}
                  </div>
                  <div className="mt-3 font-mono text-lg font-black text-slate-900 tracking-tight">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-slate-600 mt-1">
                    Date: <strong className="text-slate-900">{invoice.invoiceDate}</strong>
                  </div>
                  <div className="text-slate-600">
                    Due Date: <strong className="text-slate-900">{invoice.dueDate}</strong>
                  </div>
                  <div className="text-slate-600 mt-1.5">
                    Place of Supply: <strong className="text-slate-900">{invoice.placeOfSupply}</strong>
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">
                    Reverse Charge: <strong>{invoice.reverseCharge ? 'Yes' : 'No'}</strong>
                  </div>
                </div>
              </div>

              {/* Billed To / Buyer Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Details of Receiver (Billed To)
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-1">{invoice.customerName}</div>
                  <div className="text-slate-600 mt-0.5 whitespace-pre-line text-xs">{invoice.customerAddress}</div>
                  <div className="font-mono text-[11px] text-slate-800 mt-1.5">
                    <strong className="text-slate-600">GSTIN / Tax ID:</strong> <span className="font-bold">{invoice.customerTaxNumber || 'Unregistered Consumer (B2C)'}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right flex flex-col justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Payment Status
                    </div>
                    <div className="font-bold text-sm text-emerald-800 mt-1">
                      Mode: {invoice.paymentMode.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    State: <strong>{invoice.customerState}</strong> ({invoice.customerStateCode})
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-2 border-r border-slate-300 w-8 text-center">#</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Item Description</th>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-center w-16">HSN/SAC</th>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-right w-14">Qty</th>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-center w-12">UOM</th>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-right w-20">Rate</th>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-right w-14">Disc%</th>
                      <th className="py-2.5 px-2 border-r border-slate-300 text-right w-20">Taxable</th>
                      {invoice.isInterstate ? (
                        <th className="py-2.5 px-2 border-r border-slate-300 text-right w-24">IGST</th>
                      ) : (
                        <>
                          <th className="py-2.5 px-2 border-r border-slate-300 text-right w-16">CGST</th>
                          <th className="py-2.5 px-2 border-r border-slate-300 text-right w-16">SGST</th>
                        </>
                      )}
                      <th className="py-2.5 px-2 text-right w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono text-[11px] text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-300 font-medium text-slate-900">
                          <div>{it.description}</div>
                          {it.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</span>}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono text-[11px]">
                          {it.hsnSacCode}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-300 text-right font-mono font-semibold">
                          {it.quantity}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-300 text-center text-[10px]">
                          {it.uom}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-300 text-right font-mono">
                          {it.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-300 text-right font-mono text-slate-500">
                          {it.discountPercent > 0 ? `${it.discountPercent}%` : '-'}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-300 text-right font-mono font-medium">
                          {it.taxableAmount.toFixed(2)}
                        </td>
                        {invoice.isInterstate ? (
                          <td className="py-2.5 px-2 border-r border-slate-300 text-right font-mono">
                            <div className="text-[10px] text-slate-500">{it.igstRate}%</div>
                            <div>{(it.igstAmount || 0).toFixed(2)}</div>
                          </td>
                        ) : (
                          <>
                            <td className="py-2.5 px-2 border-r border-slate-300 text-right font-mono">
                              <div className="text-[10px] text-slate-500">{it.cgstRate}%</div>
                              <div>{(it.cgstAmount || 0).toFixed(2)}</div>
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-300 text-right font-mono">
                              <div className="text-[10px] text-slate-500">{it.sgstRate}%</div>
                              <div>{(it.sgstAmount || 0).toFixed(2)}</div>
                            </td>
                          </>
                        )}
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                          {it.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Amount In Words & Totals Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Invoice Value (in words)
                    </span>
                    <div className="text-xs font-semibold text-slate-800 italic mt-0.5">
                      {numberToWordsIndian(invoice.grandTotal)}
                    </div>
                  </div>

                  {/* Bank & UPI QR Payment Box */}
                  <div className="flex gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl items-center">
                    {company.upiId && upiPayUrl && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shrink-0 shadow-xs">
                        <QRCodeSVG value={upiPayUrl} size={84} level="M" />
                      </div>
                    )}
                    <div className="text-[11px] text-slate-600 space-y-0.5 leading-tight">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        Bank Settlement Details
                      </div>
                      <div>Bank: <strong>{company.bankName}</strong></div>
                      <div>A/C No: <strong className="font-mono text-slate-900">{company.bankAccount}</strong></div>
                      <div>IFSC: <strong className="font-mono text-slate-900">{company.bankIfsc}</strong></div>
                      {company.upiId && (
                        <div>UPI VPA: <strong className="font-mono text-emerald-800">{company.upiId}</strong></div>
                      )}
                      <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                        Scan dynamic QR to pay via any UPI app
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculations Breakdown */}
                <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="divide-y divide-slate-200 bg-white text-xs">
                    <div className="flex justify-between py-2 px-3.5">
                      <span className="text-slate-600 font-medium">Total Taxable Value</span>
                      <span className="font-mono font-semibold">{formatCurrency(invoice.subtotalTaxable, company.currencySymbol)}</span>
                    </div>
                    {invoice.isInterstate ? (
                      <div className="flex justify-between py-2 px-3.5">
                        <span className="text-slate-600 font-medium">Integrated GST (IGST)</span>
                        <span className="font-mono font-semibold">{formatCurrency(invoice.igstTotal, company.currencySymbol)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between py-2 px-3.5">
                          <span className="text-slate-600 font-medium">Central GST (CGST)</span>
                          <span className="font-mono font-semibold">{formatCurrency(invoice.cgstTotal, company.currencySymbol)}</span>
                        </div>
                        <div className="flex justify-between py-2 px-3.5">
                          <span className="text-slate-600 font-medium">State GST (SGST)</span>
                          <span className="font-mono font-semibold">{formatCurrency(invoice.sgstTotal, company.currencySymbol)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between py-1.5 px-3.5 text-[11px] text-slate-500">
                      <span>Round Off</span>
                      <span className="font-mono">{invoice.roundOff >= 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 px-3.5 bg-slate-50 text-sm font-bold text-slate-900 border-t-2 border-slate-900">
                      <span>Total Invoice Amount</span>
                      <span className="font-mono text-emerald-800 text-base">{formatCurrency(invoice.grandTotal, company.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between py-2 px-3.5 text-slate-600">
                      <span>Amount Received</span>
                      <span className="font-mono">{formatCurrency(invoice.amountReceived, company.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between py-2 px-3.5 font-bold text-amber-800 bg-amber-50/70">
                      <span>Balance Due</span>
                      <span className="font-mono text-sm">{formatCurrency(invoice.balanceDue, company.currencySymbol)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Signature Section */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div className="text-[10px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-700">Terms & Conditions:</div>
                  <p className="leading-relaxed">{company.termsAndConditions}</p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-800">For {company.legalName}</div>
                  <div className="h-12"></div>
                  <div className="text-[11px] text-slate-600 font-medium border-t border-slate-300 inline-block pt-1 min-w-[140px] text-center">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Invoice Dialog */}
        {showCancelPrompt && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-pop">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
              <h4 className="font-bold text-sm text-red-700 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Cancel Invoice & Issue Credit Note
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will mark <strong className="font-mono">{invoice.invoiceNumber}</strong> as cancelled, issue an audited credit note, and restore product stock levels.
              </p>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Reason for cancellation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goods returned, wrong item billed"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl active:scale-95 transition"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receive Payment Dialog */}
        {showPaymentPrompt && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-pop">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Record Incoming Payment
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log a partial or full payment against <strong className="font-mono">{invoice.invoiceNumber}</strong>.
              </p>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Payment Amount ({company.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  max={invoice.balanceDue}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full mt-1.5 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowPaymentPrompt(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl active:scale-95 transition"
                >
                  Save Settlement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
