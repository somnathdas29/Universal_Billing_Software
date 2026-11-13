import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  ArrowLeft, 
  UserPlus, 
  Search, 
  AlertCircle 
} from 'lucide-react';
import { 
  CompanySettings, 
  Customer, 
  ProductItem, 
  Invoice, 
  InvoiceLineItem, 
  PaymentMode 
} from '../types';
import { INDIAN_STATES, getStateFromGstin, formatCurrency, GST_SLABS, UOM_LIST } from '../utils/taxEngine';

interface NewBillViewProps {
  company: CompanySettings;
  customers: Customer[];
  products: ProductItem[];
  onSaveInvoice: (invoice: Invoice, printImmediately: boolean) => void;
  onCancel: () => void;
  onQuickAddCustomer: (customer: Customer) => void;
}

export const NewBillView: React.FC<NewBillViewProps> = ({
  company,
  customers,
  products,
  onSaveInvoice,
  onCancel,
  onQuickAddCustomer,
}) => {
  // Invoice Meta
  const invoiceNumber = `${company.invoicePrefix}${company.nextInvoiceNumber}`;
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showQuickAddCust, setShowQuickAddCust] = useState(false);

  // Quick Customer Add form
  const [newCustName, setNewCustName] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustState, setNewCustState] = useState(company.state);
  const [newCustStateCode, setNewCustStateCode] = useState(company.stateCode);

  // Place of supply
  const [placeOfSupplyCode, setPlaceOfSupplyCode] = useState<string>(company.stateCode);
  const isInterstate = company.taxSystem === 'GST_INDIA' && placeOfSupplyCode !== company.stateCode;
  const [reverseCharge, setReverseCharge] = useState(false);

  // Line items
  const [items, setItems] = useState<InvoiceLineItem[]>([
    {
      id: 'item-init',
      sku: '',
      description: '',
      hsnSacCode: '',
      quantity: 1,
      uom: 'PCS',
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 18,
      taxableAmount: 0,
      lineTotal: 0,
    },
  ]);

  // Payment settlement
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Handle customer auto-fill
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  useEffect(() => {
    if (selectedCustomer) {
      if (selectedCustomer.stateCode) {
        setPlaceOfSupplyCode(selectedCustomer.stateCode);
      }
    }
  }, [selectedCustomer]);

  // Line item calculation engine (Deterministic to exact paise)
  const calculateItem = (item: Partial<InvoiceLineItem>): InvoiceLineItem => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const discPercent = Number(item.discountPercent) || 0;
    const rate = Number(item.taxRate) || 0;

    const baseAmount = qty * price;
    const discountAmount = (baseAmount * discPercent) / 100;
    const taxableAmount = Math.round((baseAmount - discountAmount) * 100) / 100;

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;
    let vatAmount = 0;

    if (company.taxSystem === 'GST_INDIA') {
      if (isInterstate) {
        igstRate = rate;
        igstAmount = Math.round(((taxableAmount * igstRate) / 100) * 100) / 100;
      } else {
        cgstRate = rate / 2;
        sgstRate = rate / 2;
        cgstAmount = Math.round(((taxableAmount * cgstRate) / 100) * 100) / 100;
        sgstAmount = Math.round(((taxableAmount * sgstRate) / 100) * 100) / 100;
      }
    } else if (company.taxSystem === 'VAT' || company.taxSystem === 'SALES_TAX') {
      vatAmount = Math.round(((taxableAmount * rate) / 100) * 100) / 100;
    }

    const totalTaxForLine = cgstAmount + sgstAmount + igstAmount + vatAmount;
    const lineTotal = Math.round((taxableAmount + totalTaxForLine) * 100) / 100;

    return {
      id: item.id || `line-${Date.now()}-${Math.random()}`,
      productId: item.productId,
      sku: item.sku || '',
      description: item.description || '',
      hsnSacCode: item.hsnSacCode || '',
      quantity: qty,
      uom: item.uom || 'PCS',
      unitPrice: price,
      discountPercent: discPercent,
      taxRate: rate,
      taxableAmount,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      vatAmount,
      lineTotal,
    };
  };

  // Re-calculate all items when Place of Supply changes
  useEffect(() => {
    setItems(prevItems => prevItems.map(it => calculateItem(it)));
  }, [placeOfSupplyCode]);

  // Aggregate Totals
  const subtotalTaxable = Math.round(items.reduce((sum, it) => sum + it.taxableAmount, 0) * 100) / 100;
  const cgstTotal = Math.round(items.reduce((sum, it) => sum + (it.cgstAmount || 0), 0) * 100) / 100;
  const sgstTotal = Math.round(items.reduce((sum, it) => sum + (it.sgstAmount || 0), 0) * 100) / 100;
  const igstTotal = Math.round(items.reduce((sum, it) => sum + (it.igstAmount || 0), 0) * 100) / 100;
  const vatTotal = Math.round(items.reduce((sum, it) => sum + (it.vatAmount || 0), 0) * 100) / 100;
  const totalTax = cgstTotal + sgstTotal + igstTotal + vatTotal;

  const rawGrandTotal = subtotalTaxable + totalTax;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((roundedGrandTotal - rawGrandTotal) * 100) / 100;
  const grandTotal = roundedGrandTotal;

  // Set default amountReceived to full total when mode is CASH or UPI
  useEffect(() => {
    if (paymentMode === 'CASH' || paymentMode === 'UPI' || paymentMode === 'CARD') {
      setAmountReceived(grandTotal);
    } else if (paymentMode === 'CREDIT') {
      setAmountReceived(0);
    }
  }, [grandTotal, paymentMode]);

  const balanceDue = Math.max(0, Math.round((grandTotal - amountReceived) * 100) / 100);

  // Line item modifiers
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = calculateItem({ ...updated[index], [field]: value });
    setItems(updated);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const updated = [...items];
    updated[index] = calculateItem({
      ...updated[index],
      productId: prod.id,
      sku: prod.sku,
      description: prod.name,
      hsnSacCode: prod.hsnSacCode,
      uom: prod.uom,
      unitPrice: prod.sellingPrice,
      taxRate: prod.taxRate,
    });
    setItems(updated);
  };

  const addNewLine = () => {
    setItems(prev => [
      ...prev,
      calculateItem({
        id: `line-${Date.now()}`,
        sku: '',
        description: '',
        hsnSacCode: '',
        quantity: 1,
        uom: 'PCS',
        unitPrice: 0,
        discountPercent: 0,
        taxRate: 18,
      }),
    ]);
  };

  const removeLine = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Quick Customer Creation
  const handleSaveQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      taxNumber: newCustGstin.trim().toUpperCase() || undefined,
      isRegisteredTaxpayer: Boolean(newCustGstin.trim()),
      state: newCustState,
      stateCode: newCustStateCode,
      phone: newCustPhone.trim(),
      email: '',
      billingAddress: newCustAddress.trim(),
      balanceDue: 0,
      createdAt: new Date().toISOString(),
    };

    onQuickAddCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setPlaceOfSupplyCode(newCust.stateCode);
    setShowQuickAddCust(false);
  };

  // Save Bill Action
  const handleSaveBill = (printImmediately: boolean) => {
    if (!selectedCustomerId && !customerSearch.trim()) {
      alert('Please select or specify a customer');
      return;
    }

    if (items.some(i => !i.description.trim() || i.quantity <= 0)) {
      alert('Please ensure all line items have a valid description and quantity > 0');
      return;
    }

    const posState = INDIAN_STATES.find(s => s.code === placeOfSupplyCode);
    const posLabel = posState ? `${posState.name} (${posState.code})` : placeOfSupplyCode;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId: selectedCustomer ? selectedCustomer.id : 'walk-in',
      customerName: selectedCustomer ? selectedCustomer.name : customerSearch.trim(),
      customerTaxNumber: selectedCustomer?.taxNumber,
      customerState: selectedCustomer ? selectedCustomer.state : (posState?.name || ''),
      customerStateCode: placeOfSupplyCode,
      customerAddress: selectedCustomer ? selectedCustomer.billingAddress : 'Counter Sales',
      placeOfSupply: posLabel,
      placeOfSupplyCode,
      isInterstate,
      reverseCharge,
      items,
      subtotalTaxable,
      cgstTotal,
      sgstTotal,
      igstTotal,
      vatTotal,
      totalTax,
      roundOff,
      grandTotal,
      paymentMode,
      amountReceived,
      balanceDue,
      status: balanceDue <= 0.01 ? 'PAID' : amountReceived > 0 ? 'PART_PAID' : 'UNPAID',
      notes,
      createdAt: new Date().toISOString(),
    };

    onSaveInvoice(newInvoice, printImmediately);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">New Tax Invoice</h2>
              <span className="font-mono text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                {invoiceNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              CBIC Rule 46 Compliant · Counter Billing Flow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSaveBill(false)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            Save bill
          </button>
          <button
            onClick={() => handleSaveBill(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            Save & Print
          </button>
        </div>
      </div>

      {/* Primary Bill Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        {/* Customer Column */}
        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Customer Details</label>
            <button
              onClick={() => setShowQuickAddCust(true)}
              className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
            >
              <UserPlus className="w-3 h-3" />
              + Quick add
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search customer or enter walk-in name..."
              value={selectedCustomer ? selectedCustomer.name : customerSearch}
              onChange={e => {
                setSelectedCustomerId('');
                setCustomerSearch(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />

            {/* Customer Dropdown */}
            {showCustomerDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-52 overflow-y-auto">
                {customers
                  .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                  .map(cust => (
                    <div
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomerId(cust.id);
                        setCustomerSearch(cust.name);
                        setShowCustomerDropdown(false);
                      }}
                      className="p-2.5 text-xs hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none"
                    >
                      <div className="font-semibold text-slate-800">{cust.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {cust.taxNumber ? `GSTIN: ${cust.taxNumber}` : 'Unregistered B2C'} · {cust.state}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {selectedCustomer ? (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
              <div className="font-mono text-[11px] text-slate-700">
                GSTIN: <span className="font-semibold">{selectedCustomer.taxNumber || 'None (B2C)'}</span>
              </div>
              <div className="text-slate-600 truncate">{selectedCustomer.billingAddress}</div>
              {selectedCustomer.balanceDue > 0 && (
                <div className="text-[11px] text-amber-700 font-medium">
                  Past Balance Due: {formatCurrency(selectedCustomer.balanceDue, company.currencySymbol)}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              Unsaved walk-in client or cash counter bill
            </div>
          )}
        </div>

        {/* Place of Supply & Tax Rules */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700">Place of Supply (POS)</label>
          <select
            value={placeOfSupplyCode}
            onChange={e => setPlaceOfSupplyCode(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
          >
            {INDIAN_STATES.map(s => (
              <option key={s.code} value={s.code}>
                {s.code} - {s.name} {s.code === company.stateCode ? '(Intra-State)' : '(Inter-State)'}
              </option>
            ))}
          </select>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Supply Type:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isInterstate ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isInterstate ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Seller: {company.state} ({company.stateCode}) → Buyer POS: {placeOfSupplyCode}
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={reverseCharge}
              onChange={e => setReverseCharge(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-700"
            />
            <span>Tax payable under Reverse Charge (CBIC R.46)</span>
          </label>
        </div>

        {/* Invoice Dates & Terms */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700">Dates & Payment Terms</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Invoice Date</span>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500">Terms / Memo</span>
            <input
              type="text"
              placeholder="e.g. Net 15 days, PO #994"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Items & Charges</h3>
          <button
            onClick={addNewLine}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3 min-w-[200px]">Item / Product</th>
                <th className="py-2.5 px-3 w-24">HSN/SAC</th>
                <th className="py-2.5 px-3 w-20">Qty</th>
                <th className="py-2.5 px-3 w-20">Unit</th>
                <th className="py-2.5 px-3 w-28 text-right">Price ({company.currencySymbol})</th>
                <th className="py-2.5 px-3 w-16 text-right">Disc %</th>
                <th className="py-2.5 px-3 w-24 text-right">Taxable</th>
                <th className="py-2.5 px-3 w-20">GST %</th>
                <th className="py-2.5 px-3 w-28 text-right">Total ({company.currencySymbol})</th>
                <th className="py-2.5 px-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>

                  {/* Product Selector / Description */}
                  <td className="py-2 px-3">
                    <div className="space-y-1">
                      <select
                        onChange={e => handleProductSelect(idx, e.target.value)}
                        value={line.productId || ''}
                        className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-800"
                      >
                        <option value="">-- Choose from Catalog or Enter Custom --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) · {formatCurrency(p.sellingPrice, company.currencySymbol)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Item description..."
                        value={line.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded px-2 py-1 font-medium text-slate-900"
                      />
                    </div>
                  </td>

                  {/* HSN/SAC */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      placeholder="8525"
                      value={line.hsnSacCode}
                      onChange={e => handleItemChange(idx, 'hsnSacCode', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded px-2 py-1 text-center"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={line.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full text-xs font-mono font-semibold border border-slate-200 rounded px-2 py-1 text-right"
                    />
                  </td>

                  {/* UOM */}
                  <td className="py-2 px-3">
                    <select
                      value={line.uom}
                      onChange={e => handleItemChange(idx, 'uom', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white"
                    >
                      {UOM_LIST.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </td>

                  {/* Unit Price */}
                  <td className="py-2 px-3 text-right">
                    <input
                      type="number"
                      step="any"
                      value={line.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full text-xs font-mono font-medium border border-slate-200 rounded px-2 py-1 text-right"
                    />
                  </td>

                  {/* Discount % */}
                  <td className="py-2 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={line.discountPercent}
                      onChange={e => handleItemChange(idx, 'discountPercent', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 rounded px-2 py-1 text-right"
                    />
                  </td>

                  {/* Taxable Amount (Calculated) */}
                  <td className="py-2 px-3 text-right font-mono-num font-medium text-slate-700">
                    {formatCurrency(line.taxableAmount, '')}
                  </td>

                  {/* Tax Rate % */}
                  <td className="py-2 px-3">
                    <select
                      value={line.taxRate}
                      onChange={e => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                      className="w-full text-xs border border-slate-200 rounded px-1.5 py-1 bg-white font-mono"
                    >
                      {GST_SLABS.map(s => (
                        <option key={s} value={s}>{s}%</option>
                      ))}
                    </select>
                  </td>

                  {/* Line Total */}
                  <td className="py-2 px-3 text-right font-mono-num font-bold text-slate-900">
                    {formatCurrency(line.lineTotal, '')}
                  </td>

                  {/* Remove */}
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => removeLine(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-red-600 disabled:opacity-20 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Totals & Payment Settlement Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Settlement Mode */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-bold text-xs text-slate-700 tracking-wide uppercase">
            Settlement & Payment
          </h4>

          <div className="grid grid-cols-3 gap-2">
            {(['UPI', 'CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'CREDIT'] as PaymentMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition ${
                  paymentMode === mode
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-medium text-slate-600">Amount Received ({company.currencySymbol})</span>
              <input
                type="number"
                step="any"
                value={amountReceived}
                onChange={e => setAmountReceived(Number(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-600">Balance Due</span>
              <div className={`mt-1 px-3 py-2 text-sm font-mono font-bold rounded-lg border ${
                balanceDue > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {formatCurrency(balanceDue, company.currencySymbol)}
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Taxable Value):</span>
            <span className="font-mono-num font-medium text-slate-900">
              {formatCurrency(subtotalTaxable, company.currencySymbol)}
            </span>
          </div>

          {company.taxSystem === 'GST_INDIA' && (
            <>
              {isInterstate ? (
                <div className="flex justify-between text-purple-700 font-medium">
                  <span>IGST (Integrated Tax):</span>
                  <span className="font-mono-num">
                    {formatCurrency(igstTotal, company.currencySymbol)}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (Central Tax):</span>
                    <span className="font-mono-num font-medium text-slate-900">
                      {formatCurrency(cgstTotal, company.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (State Tax):</span>
                    <span className="font-mono-num font-medium text-slate-900">
                      {formatCurrency(sgstTotal, company.currencySymbol)}
                    </span>
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Round-off adjustment:</span>
            <span className="font-mono-num">
              {roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900">Grand Total:</span>
            <span className="text-2xl font-bold font-mono-num text-emerald-800">
              {formatCurrency(grandTotal, company.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickAddCust && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveQuickCustomer}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              Quick Add Customer
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700">Customer / Trade Name *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={e => setNewCustName(e.target.value)}
                placeholder="e.g. Apex Infotech Solutions"
                className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">GSTIN (Optional for B2C)</label>
              <input
                type="text"
                maxLength={15}
                value={newCustGstin}
                onChange={e => {
                  const val = e.target.value.toUpperCase();
                  setNewCustGstin(val);
                  const st = getStateFromGstin(val);
                  if (st) {
                    setNewCustState(st.name);
                    setNewCustStateCode(st.code);
                  }
                }}
                placeholder="27AAJCV4821M1Z6"
                className="w-full mt-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">State & Code</label>
                <select
                  value={newCustStateCode}
                  onChange={e => {
                    const st = INDIAN_STATES.find(s => s.code === e.target.value);
                    if (st) {
                      setNewCustStateCode(st.code);
                      setNewCustState(st.name);
                    }
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Billing Address</label>
              <textarea
                rows={2}
                value={newCustAddress}
                onChange={e => setNewCustAddress(e.target.value)}
                placeholder="Shop/Street address..."
                className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuickAddCust(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold"
              >
                Save & Select
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
