import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { Customer, CompanySettings, Invoice } from '../types';
import { INDIAN_STATES, getStateFromGstin, formatCurrency } from '../utils/taxEngine';

interface CustomersViewProps {
  customers: Customer[];
  company: CompanySettings;
  invoices: Invoice[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onNewBillForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  company,
  invoices,
  onAddCustomer,
  onUpdateCustomer,
  onNewBillForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'B2B' | 'B2C' | 'DUE'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [state, setState] = useState(company.state);
  const [stateCode, setStateCode] = useState(company.stateCode);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const filtered = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.taxNumber && c.taxNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm);

    if (filterType === 'B2B') return matchSearch && c.isRegisteredTaxpayer;
    if (filterType === 'B2C') return matchSearch && !c.isRegisteredTaxpayer;
    if (filterType === 'DUE') return matchSearch && (c.balanceDue || 0) > 0;
    return matchSearch;
  });

  const handleOpenAdd = () => {
    setName('');
    setTaxNumber('');
    setState(company.state);
    setStateCode(company.stateCode);
    setPhone('');
    setEmail('');
    setBillingAddress('');
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setName(c.name);
    setTaxNumber(c.taxNumber || '');
    setState(c.state);
    setStateCode(c.stateCode);
    setPhone(c.phone);
    setEmail(c.email);
    setBillingAddress(c.billingAddress);
    setEditingCustomer(c);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isReg = Boolean(taxNumber.trim());

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name: name.trim(),
        taxNumber: taxNumber.trim().toUpperCase() || undefined,
        isRegisteredTaxpayer: isReg,
        state,
        stateCode,
        phone: phone.trim(),
        email: email.trim(),
        billingAddress: billingAddress.trim(),
      });
    } else {
      onAddCustomer({
        id: `cust-${Date.now()}`,
        name: name.trim(),
        taxNumber: taxNumber.trim().toUpperCase() || undefined,
        isRegisteredTaxpayer: isReg,
        state,
        stateCode,
        phone: phone.trim(),
        email: email.trim(),
        billingAddress: billingAddress.trim(),
        balanceDue: 0,
        createdAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer Accounts</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            B2B GSTIN profiles & retail consumer directory
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg dark:shadow-emerald-950/50 transition border border-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          Add customer
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search customers by name, GSTIN, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'B2B', 'B2C', 'DUE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterType === type
                  ? 'bg-slate-900 dark:bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {type === 'ALL' ? 'All accounts' : type === 'DUE' ? 'With balance due' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map(cust => {
          return (
            <div
              key={cust.id}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{cust.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    cust.isRegisteredTaxpayer
                      ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {cust.isRegisteredTaxpayer ? 'B2B' : 'B2C'}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                  {cust.taxNumber ? `GSTIN: ${cust.taxNumber}` : 'Unregistered consumer'}
                </div>

                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.billingAddress || `${cust.state} (${cust.stateCode})`}</span>
                  </div>
                  {cust.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{cust.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Balance Due</div>
                  <div className={`font-mono font-bold ${
                    cust.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {formatCurrency(cust.balanceDue || 0, company.currencySymbol)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Edit profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNewBillForCustomer(cust)}
                    className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg font-semibold text-xs border border-emerald-200 dark:border-emerald-800 transition shadow-2xs"
                  >
                    + Bill
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Legal / Trade Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">GSTIN / Tax ID</label>
              <input
                type="text"
                maxLength={15}
                value={taxNumber}
                onChange={e => {
                  const val = e.target.value.toUpperCase();
                  setTaxNumber(val);
                  const st = getStateFromGstin(val);
                  if (st) {
                    setState(st.name);
                    setStateCode(st.code);
                  }
                }}
                placeholder="27AAJCV4821M1Z6"
                className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State Code</label>
                <select
                  value={stateCode}
                  onChange={e => {
                    const st = INDIAN_STATES.find(s => s.code === e.target.value);
                    if (st) {
                      setStateCode(st.code);
                      setState(st.name);
                    }
                  }}
                  className="w-full mt-1 px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Billing Address</label>
              <textarea
                rows={2}
                value={billingAddress}
                onChange={e => setBillingAddress(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
