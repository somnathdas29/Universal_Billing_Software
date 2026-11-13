import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertCircle, 
  Edit, 
  CheckCircle2 
} from 'lucide-react';
import { ProductItem, CompanySettings } from '../types';
import { formatCurrency, GST_SLABS, UOM_LIST } from '../utils/taxEngine';

interface InventoryViewProps {
  products: ProductItem[];
  company: CompanySettings;
  onAddProduct: (product: ProductItem) => void;
  onUpdateProduct: (product: ProductItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  company,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [hsnSacCode, setHsnSacCode] = useState('');
  const [uom, setUom] = useState('PCS');
  const [taxRate, setTaxRate] = useState(18);
  const [purchaseCost, setPurchaseCost] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(10);
  const [reorderPoint, setReorderPoint] = useState(5);
  const [category, setCategory] = useState('');

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hsnSacCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLow = !filterLowStock || p.currentStock <= p.reorderPoint;
    return matchSearch && matchLow;
  });

  const lowStockCount = products.filter(p => p.currentStock <= p.reorderPoint).length;

  const handleOpenAdd = () => {
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription('');
    setHsnSacCode('8525');
    setUom('PCS');
    setTaxRate(18);
    setPurchaseCost(1000);
    setSellingPrice(1499);
    setCurrentStock(20);
    setReorderPoint(5);
    setCategory('General');
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setName(p.name);
    setSku(p.sku);
    setDescription(p.description || '');
    setHsnSacCode(p.hsnSacCode);
    setUom(p.uom);
    setTaxRate(p.taxRate);
    setPurchaseCost(p.purchaseCost);
    setSellingPrice(p.sellingPrice);
    setCurrentStock(p.currentStock);
    setReorderPoint(p.reorderPoint);
    setCategory(p.category || '');
    setEditingProduct(p);
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim(),
        hsnSacCode: hsnSacCode.trim(),
        uom,
        taxRate,
        purchaseCost,
        sellingPrice,
        currentStock,
        reorderPoint,
        category: category.trim(),
      });
    } else {
      onAddProduct({
        id: `prod-${Date.now()}`,
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim(),
        hsnSacCode: hsnSacCode.trim(),
        uom,
        taxRate,
        purchaseCost,
        sellingPrice,
        currentStock,
        reorderPoint,
        category: category.trim(),
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Items & Inventory</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700">
              {products.length} Catalog Items
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Real-time stock decrements upon billing · HSN/SAC Mapping & low-stock alerts
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg dark:shadow-emerald-950/50 transition border border-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          New catalog item
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search items by name, SKU, or HSN..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 bg-slate-50/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
        </div>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
            filterLowStock
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold'
              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Show low stock only ({lowStockCount})</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">HSN / SAC</th>
                <th className="py-3 px-4">GST Rate</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {filtered.map(p => {
                const isLow = p.currentStock <= p.reorderPoint;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        SKU: {p.sku} {p.category ? `· ${p.category}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                      {p.hsnSacCode}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                      {p.taxRate}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num text-slate-500 dark:text-slate-400">
                      {formatCurrency(p.purchaseCost, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.sellingPrice, company.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold">
                      <span className={isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-emerald-400'}>
                        {p.currentStock} {p.uom}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Low Stock (≤{p.reorderPoint})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              {editingProduct ? 'Edit Catalog Item' : 'New Catalog Item'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Hikvision 4MP IP Dome Camera"
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">HSN/SAC Code *</label>
                <input
                  type="text"
                  required
                  value={hsnSacCode}
                  onChange={e => setHsnSacCode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Unit of Measure (UOM)</label>
                <select
                  value={uom}
                  onChange={e => setUom(e.target.value)}
                  className="w-full mt-1 px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {UOM_LIST.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">GST Slab (%)</label>
                <select
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                  className="w-full mt-1 px-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                >
                  {GST_SLABS.map(s => (
                    <option key={s} value={s}>{s}%</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Selling Price ({company.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Purchase Cost ({company.currencySymbol})</label>
                <input
                  type="number"
                  step="any"
                  value={purchaseCost}
                  onChange={e => setPurchaseCost(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Stock</label>
                <input
                  type="number"
                  value={currentStock}
                  onChange={e => setCurrentStock(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reorder Alert Level</label>
                <input
                  type="number"
                  value={reorderPoint}
                  onChange={e => setReorderPoint(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
