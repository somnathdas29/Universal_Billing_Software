export type TaxSystem = 'GST_INDIA' | 'VAT' | 'SALES_TAX' | 'NO_TAX';

export interface CompanySettings {
  legalName: string;
  tradeName: string;
  taxSystem: TaxSystem;
  taxNumberLabel: string;
  taxNumber: string;
  state: string;
  stateCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  currencySymbol: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  financialYear: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
  termsAndConditions: string;
}

export interface Customer {
  id: string;
  name: string;
  tradeName?: string;
  taxNumber?: string;
  isRegisteredTaxpayer: boolean;
  state: string;
  stateCode: string;
  phone: string;
  email: string;
  billingAddress: string;
  shippingAddress?: string;
  balanceDue: number;
  createdAt: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  hsnSacCode: string;
  uom: string;
  taxRate: number;
  purchaseCost: number;
  sellingPrice: number;
  currentStock: number;
  reorderPoint: number;
  category?: string;
}

export interface InvoiceLineItem {
  id: string;
  productId?: string;
  sku: string;
  description: string;
  hsnSacCode: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  taxableAmount: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  vatAmount?: number;
  lineTotal: number;
}

export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CREDIT' | 'CARD';
export type InvoiceStatus = 'PAID' | 'PART_PAID' | 'UNPAID' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerTaxNumber?: string;
  customerState: string;
  customerStateCode: string;
  customerAddress: string;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  isInterstate: boolean;
  reverseCharge: boolean;
  items: InvoiceLineItem[];
  subtotalTaxable: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  vatTotal: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  amountReceived: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  reason: string;
  taxableValue: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
}

export interface Quotation {
  id: string;
  estimateNumber: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerTaxNumber?: string;
  items: InvoiceLineItem[];
  taxableAmount: number;
  totalTax: number;
  grandTotal: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'CONVERTED';
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  dispatchFrom: string;
  shipTo: string;
  transportMode: string;
  vehicleNumber: string;
  reasonForChallan: 'SUPPLY_ON_APPROVAL' | 'JOB_WORK' | 'EXHIBITION' | 'OTHER';
  items: Array<{ description: string; hsnSacCode: string; quantity: number; uom: string }>;
  status: 'DISPATCHED' | 'DELIVERED' | 'RETURNED';
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  supplierName: string;
  supplierGstin: string;
  date: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  itcEligible: boolean;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  gstAmount: number;
  paymentMode: PaymentMode;
}
