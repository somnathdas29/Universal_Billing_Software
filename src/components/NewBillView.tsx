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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Cancel & Back to Overview"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">New Tax Invoice</h2>
              <span className="font-mono text-xs px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-md font-bold border border-emerald-300/80 dark:border-emerald-700/60 shadow-2xs">
                {invoiceNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              CBIC Rule 46 Compliant · High-Speed Counter Billing Flow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleSaveBill(false)}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition shadow-xs"
          >
            <Save className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Save bill
          </button>
          <button
            onClick={() => handleSaveBill(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg dark:shadow-emerald-950/50 transition border border-emerald-600/30"
          >
            <Printer className="w-4 h-4" />
            Save & Print
          </button>
        </div>
      </div>

      {/* Primary Bill Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        {/* Customer Column */}
        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Customer Details</label>
            <button
              onClick={() => setShowQuickAddCust(true)}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 dark:focus:ring-emerald-500/30 focus:border-emerald-600 dark:focus:border-emerald-500 transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-2.5" />

            {/* Customer Dropdown */}
            {showCustomerDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 max-h-56 overflow-y-auto">
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
                      className="p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer border-b border-slate-100 dark:border-slate-800/60 last:border-none transition"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{cust.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {cust.taxNumber ? `GSTIN: ${cust.taxNumber}` : 'Unregistered B2C'} · {cust.state}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {selectedCustomer ? (
            <div className="p-3.5 bg-slate-50/90 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1.5">
              <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                GSTIN: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{selectedCustomer.taxNumber || 'None (B2C)'}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 truncate text-[11px]">{selectedCustomer.billingAddress}</div>
              {selectedCustomer.balanceDue > 0 && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <span>Past Balance:</span>
                  <span className="font-mono-num">{formatCurrency(selectedCustomer.balanceDue, company.currencySymbol)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 italic px-1">
              Unsaved walk-in client or cash counter bill
            </div>
          )}
        </div>

        {/* Place of Supply & Tax Rules */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Place of Supply (POS)</label>
          <select
            value={placeOfSupplyCode}
            onChange={e => setPlaceOfSupplyCode(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 dark:focus:ring-emerald-500/30 focus:border-emerald-600 dark:focus:border-emerald-500 transition"
          >
            {INDIAN_STATES.map(s => (
              <option key={s.code} value={s.code}>
                {s.code} - {s.name} {s.code === company.stateCode ? '(Intra-State)' : '(Inter-State)'}
              </option>
            ))}
          </select>

          <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 bg-slate-50/90 dark:bg-slate-800/50 text-xs space-y-1.5">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Supply Type:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isInterstate ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}>
                {isInterstate ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Seller: {company.state} ({company.stateCode}) → Buyer POS: {placeOfSupplyCode}
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={reverseCharge}
              onChange={e => setReverseCharge(e.target.checked)}
              className="rounded text-emerald-700 dark:text-emerald-500 focus:ring-emerald-600 dark:bg-slate-800 dark:border-slate-700"
            />
            <span>Tax payable under Reverse Charge (CBIC R.46)</span>
          </label>
        </div>

        {/* Invoice Dates & Terms */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Dates & Payment Terms</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Invoice Date</span>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Terms / Memo</span>
            <input
              type="text"
              placeholder="e.g. Net 15 days, PO #994"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full mt-0.5 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Items & Charges</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Deterministic 0.00 paise tax computation</p>
          </div>
          <button
            onClick={addNewLine}
            className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700/80 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3 w-8">#</th>
                <th className="py-3 px-3 min-w-[220px]">Item / Product</th>
                <th className="py-3 px-3 w-24">HSN/SAC</th>
                <th className="py-3 px-3 w-20">Qty</th>
                <th className="py-3 px-3 w-20">Unit</th>
                <th className="py-3 px-3 w-28 text-right">Price ({company.currencySymbol})</th>
                <th className="py-3 px-3 w-16 text-right">Disc %</th>
                <th className="py-3 px-3 w-24 text-right">Taxable</th>
                <th className="py-3 px-3 w-20">GST %</th>
                <th className="py-3 px-3 w-28 text-right">Total ({company.currencySymbol})</th>
                <th className="py-3 px-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {items.map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>

                  {/* Product Selector / Description */}
                  <td className="py-2.5 px-3">
                    <div className="space-y-1.5">
                      <select
                        onChange={e => handleProductSelect(idx, e.target.value)}
                        value={line.productId || ''}
                        className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
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
                        className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </td>

                  {/* HSN/SAC */}
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="8525"
                      value={line.hsnSacCode}
                      onChange={e => handleItemChange(idx, 'hsnSacCode', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={line.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-right bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </td>

                  {/* UOM */}
                  <td className="py-2.5 px-3">
                    <select
                      value={line.uom}
                      onChange={e => handleItemChange(idx, 'uom', e.target.value)}
                      className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {UOM_LIST.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </td>

                  {/* Unit Price */}
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      step="any"
                      value={line.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-right bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </td>

                  {/* Discount % */}
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={line.discountPercent}
                      onChange={e => handleItemChange(idx, 'discountPercent', e.target.value)}
                      className="w-full text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-right bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </td>

                  {/* Taxable Amount (Calculated) */}
                  <td className="py-2.5 px-3 text-right font-mono-num font-semibold text-slate-700 dark:text-slate-300">
                    {formatCurrency(line.taxableAmount, '')}
                  </td>

                  {/* Tax Rate % */}
                  <td className="py-2.5 px-3">
                    <select
                      value={line.taxRate}
                      onChange={e => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                      className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    >
                      {GST_SLABS.map(s => (
                        <option key={s} value={s}>{s}%</option>
                      ))}
                    </select>
                  </td>

                  {/* Line Total */}
                  <td className="py-2.5 px-3 text-right font-mono-num font-bold text-slate-900 dark:text-emerald-400">
                    {formatCurrency(line.lineTotal, '')}
                  </td>

                  {/* Remove */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => removeLine(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-20 transition"
                      title="Remove item row"
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
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Settlement & Payment Mode
          </h4>

          <div className="grid grid-cols-3 gap-2">
            {(['UPI', 'CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'CREDIT'] as PaymentMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                  paymentMode === mode
                    ? 'bg-slate-900 dark:bg-emerald-700 text-white border-slate-900 dark:border-emerald-600 shadow-sm'
                    : 'bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Amount Received ({company.currencySymbol})</span>
              <input
                type="number"
                step="any"
                value={amountReceived}
                onChange={e => setAmountReceived(Number(e.target.value) || 0)}
                className="w-full mt-1.5 px-3 py-2 text-sm font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Balance Due</span>
              <div className={`mt-1.5 px-3 py-2 text-sm font-mono font-bold rounded-xl border ${
                balanceDue > 0
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
              }`}>
                {formatCurrency(balanceDue, company.currencySymbol)}
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Subtotal (Taxable Value):</span>
            <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(subtotalTaxable, company.currencySymbol)}
            </span>
          </div>

          {company.taxSystem === 'GST_INDIA' && (
            <>
              {isInterstate ? (
                <div className="flex justify-between text-purple-700 dark:text-purple-400 font-semibold">
                  <span>IGST (Integrated Tax):</span>
                  <span className="font-mono-num">
                    {formatCurrency(igstTotal, company.currencySymbol)}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>CGST (Central Tax):</span>
                    <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(cgstTotal, company.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>SGST (State Tax):</span>
                    <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(sgstTotal, company.currencySymbol)}
                    </span>
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
            <span>Round-off adjustment:</span>
            <span className="font-mono-num">
              {roundOff >= 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Grand Total:</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-num text-emerald-700 dark:text-emerald-400">
              {formatCurrency(grandTotal, company.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickAddCust && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveQuickCustomer}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <UserPlus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              Quick Add Customer
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customer / Trade Name *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={e => setNewCustName(e.target.value)}
                placeholder="e.g. Apex Infotech Solutions"
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">GSTIN (Optional for B2C)</label>
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
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State & Code</label>
                <select
                  value={newCustStateCode}
                  onChange={e => {
                    const st = INDIAN_STATES.find(s => s.code === e.target.value);
                    if (st) {
                      setNewCustStateCode(st.code);
                      setNewCustState(st.name);
                    }
                  }}
                  className="w-full mt-1 px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="+91 98..."
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Billing Address</label>
              <textarea
                rows={2}
                value={newCustAddress}
                onChange={e => setNewCustAddress(e.target.value)}
                placeholder="Shop/Street address..."
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowQuickAddCust(false)}
                className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition"
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
