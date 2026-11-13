import { useState, useEffect } from 'react';
import { CompanySettings, Customer, ProductItem, Invoice, CreditNote } from '../types';
import { INITIAL_COMPANY, INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_INVOICES } from '../mockData';

const STORAGE_KEYS = {
  COMPANY: 'payzenmax_company_v1',
  CUSTOMERS: 'payzenmax_customers_v1',
  PRODUCTS: 'payzenmax_products_v1',
  INVOICES: 'payzenmax_invoices_v1',
  CREDIT_NOTES: 'payzenmax_credit_notes_v1',
};

export function useBillingStorage() {
  const [company, setCompany] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CREDIT_NOTES);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CREDIT_NOTES, JSON.stringify(creditNotes));
  }, [creditNotes]);

  // Actions
  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);

    // Update product stock levels
    setProducts(prev => {
      const updated = [...prev];
      for (const item of invoice.items) {
        if (item.productId) {
          const idx = updated.findIndex(p => p.id === item.productId);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              currentStock: Math.max(0, updated[idx].currentStock - item.quantity),
            };
          }
        }
      }
      return updated;
    });

    // Update customer balance
    setCustomers(prev => {
      return prev.map(c => {
        if (c.id === invoice.customerId) {
          return {
            ...c,
            balanceDue: (c.balanceDue || 0) + invoice.balanceDue,
          };
        }
        return c;
      });
    });

    // Increment next invoice number
    setCompany(prev => ({
      ...prev,
      nextInvoiceNumber: prev.nextInvoiceNumber + 1,
    }));
  };

  const cancelInvoice = (invoiceId: string, reason: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status === 'CANCELLED') return;

    setInvoices(prev =>
      prev.map(i => (i.id === invoiceId ? { ...i, status: 'CANCELLED' } : i))
    );

    // Create credit note
    const cn: CreditNote = {
      id: `cn-${Date.now()}`,
      creditNoteNumber: `CN/${inv.invoiceNumber.replace(/^[^/]+\//, '')}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      customerId: inv.customerId,
      customerName: inv.customerName,
      reason: reason || 'Goods returned / cancellation',
      taxableValue: inv.subtotalTaxable,
      taxAmount: inv.totalTax,
      totalAmount: inv.grandTotal,
      createdAt: new Date().toISOString(),
    };
    setCreditNotes(prev => [cn, ...prev]);

    // Restore stock
    setProducts((prev: ProductItem[]) => {
      const updated = [...prev];
      for (const item of inv.items) {
        if (item.productId) {
          const idx = updated.findIndex(p => p.id === item.productId);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              currentStock: updated[idx].currentStock + item.quantity,
            };
          }
        }
      }
      return updated;
    });

    // Reduce customer balance
    setCustomers(prev =>
      prev.map(c =>
        c.id === inv.customerId
          ? { ...c, balanceDue: Math.max(0, (c.balanceDue || 0) - inv.balanceDue) }
          : c
      )
    );
  };

  const recordPayment = (invoiceId: string, amount: number) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          const newReceived = inv.amountReceived + amount;
          const newBalance = Math.max(0, inv.grandTotal - newReceived);
          const newStatus = newBalance <= 0.01 ? 'PAID' : 'PART_PAID';
          return {
            ...inv,
            amountReceived: newReceived,
            balanceDue: newBalance,
            status: newStatus,
          };
        }
        return inv;
      })
    );

    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === inv.customerId
            ? { ...c, balanceDue: Math.max(0, (c.balanceDue || 0) - amount) }
            : c
        )
      );
    }
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => prev.map(c => (c.id === customer.id ? customer : c)));
  };

  const addProduct = (product: ProductItem) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (product: ProductItem) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
  };

  const resetToDemo = () => {
    setCompany(INITIAL_COMPANY);
    setCustomers(INITIAL_CUSTOMERS);
    setProducts(INITIAL_PRODUCTS);
    setInvoices(INITIAL_INVOICES);
    setCreditNotes([]);
    localStorage.clear();
  };

  const exportStateJson = () => {
    const data = {
      app: 'PayzenMax Universal',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      company,
      customers,
      products,
      invoices,
      creditNotes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payzenmax-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importStateJson = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.company) setCompany(data.company);
      if (data.customers) setCustomers(data.customers);
      if (data.products) setProducts(data.products);
      if (data.invoices) setInvoices(data.invoices);
      if (data.creditNotes) setCreditNotes(data.creditNotes);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  return {
    company,
    setCompany,
    customers,
    products,
    invoices,
    creditNotes,
    addInvoice,
    cancelInvoice,
    recordPayment,
    addCustomer,
    updateCustomer,
    addProduct,
    updateProduct,
    resetToDemo,
    exportStateJson,
    importStateJson,
  };
}
