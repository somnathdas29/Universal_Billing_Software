import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  Ban, 
  ArrowLeft, 
  CheckCircle, 
  QrCode, 
  ExternalLink 
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
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 md:p-8 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-3 sm:my-6 border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Action Bar (No-Print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 no-print sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition group flex items-center gap-1 text-xs font-semibold"
              title="Close and return"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <div>
              <span className="font-bold text-sm tracking-wide font-mono">{invoice.invoiceNumber}</span>
              <span className={`ml-2 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                invoice.status === 'PAID' ? 'bg-emerald-500/90 text-white' :
                invoice.status === 'PART_PAID' ? 'bg-amber-500/90 text-white' :
                invoice.status === 'CANCELLED' ? 'bg-red-500/90 text-white' : 'bg-slate-700 text-slate-200'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Copy Designation Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
            {(['Original', 'Duplicate', 'Triplicate'] as const).map(copy => (
              <button
                key={copy}
                onClick={() => setActiveCopy(copy)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  activeCopy === copy ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {copy}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {invoice.status !== 'CANCELLED' && invoice.balanceDue > 0 && (
              <button
                onClick={() => setShowPaymentPrompt(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded-lg font-medium transition"
              >
                Receive payment
              </button>
            )}

            <button
              onClick={handleShareWhatsapp}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs rounded-lg transition"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            {invoice.status !== 'CANCELLED' && (
              <button
                onClick={() => setShowCancelPrompt(true)}
                className="p-2 bg-red-950/40 text-red-300 hover:bg-red-900/60 hover:text-white rounded-lg transition"
                title="Cancel Invoice & Issue Credit Note"
              >
                <Ban className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Printable CBIC Rule 46 Tax Invoice Container */}
        <div id="printable-invoice" className="p-8 bg-white text-slate-900 flex-1 overflow-y-auto text-xs space-y-6">
          {/* Header & Copy Type */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                CBIC Rule 46 Tax Invoice
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                {company.legalName}
              </h1>
              {company.tradeName && (
                <div className="text-xs text-slate-600 font-medium">({company.tradeName})</div>
              )}
              <div className="text-slate-600 mt-1 max-w-sm">
                {company.addressLine1}, {company.addressLine2 ? `${company.addressLine2}, ` : ''}
                {company.city}, {company.state} - {company.pincode}
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-800">
                <strong>{company.taxNumberLabel}:</strong> {company.taxNumber} · <strong>State Code:</strong> {company.stateCode}
              </div>
              <div className="text-[11px] text-slate-500">
                Phone: {company.phone} · Email: {company.email}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                {activeCopy} for {activeCopy === 'Original' ? 'Recipient' : activeCopy === 'Duplicate' ? 'Transporter' : 'Supplier'}
              </div>
              <div className="mt-3 font-mono text-base font-bold text-slate-900">
                {invoice.invoiceNumber}
              </div>
              <div className="text-slate-600 mt-0.5">
                Date: <strong>{invoice.invoiceDate}</strong>
              </div>
              <div className="text-slate-600">
                Due Date: <strong>{invoice.dueDate}</strong>
              </div>
              <div className="text-slate-600 mt-1">
                Place of Supply: <strong>{invoice.placeOfSupply}</strong>
              </div>
              <div className="text-slate-500 text-[10px] mt-0.5">
                Reverse Charge: <strong>{invoice.reverseCharge ? 'Yes' : 'No'}</strong>
              </div>
            </div>
          </div>

          {/* Billed To / Buyer Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Details of Receiver (Billed To)
              </div>
              <div className="font-bold text-sm text-slate-900 mt-1">{invoice.customerName}</div>
              <div className="text-slate-600 mt-0.5 whitespace-pre-line">{invoice.customerAddress}</div>
              <div className="font-mono text-[11px] text-slate-800 mt-1">
                <strong>GSTIN / Tax ID:</strong> {invoice.customerTaxNumber || 'Unregistered Consumer (B2C)'}
              </div>
            </div>

            <div className="text-right flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 text-[11px]">
              <tr>
                <th className="py-2 px-2 border-r border-slate-300 w-8 text-center">#</th>
                <th className="py-2 px-3 border-r border-slate-300">Item Description</th>
                <th className="py-2 px-2 border-r border-slate-300 text-center w-16">HSN/SAC</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right w-14">Qty</th>
                <th className="py-2 px-2 border-r border-slate-300 text-center w-12">UOM</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right w-20">Rate</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right w-14">Disc%</th>
                <th className="py-2 px-2 border-r border-slate-300 text-right w-20">Taxable</th>
                {invoice.isInterstate ? (
                  <th className="py-2 px-2 border-r border-slate-300 text-right w-24">IGST</th>
                ) : (
                  <>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-16">CGST</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-16">SGST</th>
                  </>
                )}
                <th className="py-2 px-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((it, idx) => (
                <tr key={it.id}>
                  <td className="py-2 px-2 border-r border-slate-300 text-center font-mono text-[11px] text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-300 font-medium text-slate-900">
                    <div>{it.description}</div>
                    {it.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</span>}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-center font-mono text-[11px]">
                    {it.hsnSacCode}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-right font-mono-num font-semibold">
                    {it.quantity}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-center text-[10px]">
                    {it.uom}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-right font-mono-num">
                    {it.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-right font-mono-num text-slate-500">
                    {it.discountPercent > 0 ? `${it.discountPercent}%` : '-'}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-300 text-right font-mono-num font-medium">
                    {it.taxableAmount.toFixed(2)}
                  </td>
                  {invoice.isInterstate ? (
                    <td className="py-2 px-2 border-r border-slate-300 text-right font-mono-num">
                      <div className="text-[10px] text-slate-500">{it.igstRate}%</div>
                      <div>{(it.igstAmount || 0).toFixed(2)}</div>
                    </td>
                  ) : (
                    <>
                      <td className="py-2 px-2 border-r border-slate-300 text-right font-mono-num">
                        <div className="text-[10px] text-slate-500">{it.cgstRate}%</div>
                        <div>{(it.cgstAmount || 0).toFixed(2)}</div>
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-right font-mono-num">
                        <div className="text-[10px] text-slate-500">{it.sgstRate}%</div>
                        <div>{(it.sgstAmount || 0).toFixed(2)}</div>
                      </td>
                    </>
                  )}
                  <td className="py-2 px-2 text-right font-mono-num font-bold text-slate-900">
                    {it.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Amount In Words & Totals Summary */}
          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Invoice Value (in words)
                </span>
                <div className="text-xs font-semibold text-slate-800 italic mt-0.5">
                  {numberToWordsIndian(invoice.grandTotal)}
                </div>
              </div>

              {/* Bank & UPI QR Payment Box */}
              <div className="flex gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg items-center">
                {company.upiId && upiPayUrl && (
                  <div className="bg-white p-1.5 rounded border border-slate-200 shrink-0">
                    <QRCodeSVG value={upiPayUrl} size={84} level="M" />
                  </div>
                )}
                <div className="text-[11px] text-slate-600 space-y-0.5 leading-tight">
                  <div className="font-bold text-slate-800 mb-1">Bank Settlement Details</div>
                  <div>Bank: <strong>{company.bankName}</strong></div>
                  <div>A/C No: <strong className="font-mono">{company.bankAccount}</strong></div>
                  <div>IFSC: <strong className="font-mono">{company.bankIfsc}</strong></div>
                  {company.upiId && (
                    <div>UPI VPA: <strong className="font-mono">{company.upiId}</strong></div>
                  )}
                  <div className="text-[10px] text-emerald-800 font-semibold pt-0.5">
                    Scan dynamic QR to pay via any UPI app
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="divide-y divide-slate-200 bg-white text-xs">
                <div className="flex justify-between py-1.5 px-3">
                  <span className="text-slate-600">Total Taxable Value</span>
                  <span className="font-mono-num font-medium">{formatCurrency(invoice.subtotalTaxable, company.currencySymbol)}</span>
                </div>
                {invoice.isInterstate ? (
                  <div className="flex justify-between py-1.5 px-3">
                    <span className="text-slate-600">Integrated GST (IGST)</span>
                    <span className="font-mono-num font-medium">{formatCurrency(invoice.igstTotal, company.currencySymbol)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-1.5 px-3">
                      <span className="text-slate-600">Central GST (CGST)</span>
                      <span className="font-mono-num font-medium">{formatCurrency(invoice.cgstTotal, company.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3">
                      <span className="text-slate-600">State GST (SGST)</span>
                      <span className="font-mono-num font-medium">{formatCurrency(invoice.sgstTotal, company.currencySymbol)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-1.5 px-3 text-[11px] text-slate-500">
                  <span>Round Off</span>
                  <span className="font-mono-num">{invoice.roundOff >= 0 ? `+${invoice.roundOff.toFixed(2)}` : invoice.roundOff.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-slate-50 text-sm font-bold text-slate-900 border-t-2 border-slate-900">
                  <span>Total Invoice Amount</span>
                  <span className="font-mono-num text-emerald-900">{formatCurrency(invoice.grandTotal, company.currencySymbol)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 text-slate-600">
                  <span>Amount Received</span>
                  <span className="font-mono-num">{formatCurrency(invoice.amountReceived, company.currencySymbol)}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 font-semibold text-amber-800 bg-amber-50/50">
                  <span>Balance Due</span>
                  <span className="font-mono-num">{formatCurrency(invoice.balanceDue, company.currencySymbol)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Signature Section */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 items-end">
            <div className="text-[10px] text-slate-500 space-y-1">
              <div className="font-bold text-slate-700">Terms & Conditions:</div>
              <p className="leading-relaxed">{company.termsAndConditions}</p>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">For {company.legalName}</div>
              <div className="h-14"></div>
              <div className="text-[11px] text-slate-600 font-medium">Authorized Signatory</div>
            </div>
          </div>
        </div>

        {/* Cancel Invoice Dialog */}
        {showCancelPrompt && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-3">
              <h4 className="font-bold text-sm text-red-700 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Cancel Invoice & Issue Credit Note
              </h4>
              <p className="text-xs text-slate-600">
                This will mark <strong>{invoice.invoiceNumber}</strong> as cancelled, issue an audited credit note, and restore product stock levels.
              </p>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Reason for cancellation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goods returned, wrong item billed"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receive Payment Dialog */}
        {showPaymentPrompt && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                Record Incoming Payment
              </h4>
              <p className="text-xs text-slate-600">
                Log a partial or full payment against <strong>{invoice.invoiceNumber}</strong>.
              </p>
              <div>
                <label className="text-[11px] font-semibold text-slate-700">Payment Amount ({company.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  max={invoice.balanceDue}
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowPaymentPrompt(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg"
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
