# PayzenMax Universal Billing Software

A high-speed, offline-first universal billing and tax compliance platform built following the architecture and design of **[PayzenMax.com](https://payzenmax.sujoymoulick05.workers.dev/)**.

---

## 🌟 Key Features

1. **⚡ Fast Counter Billing (`Alt+N`)**:
   - Keyboard accelerator for immediate new invoice creation.
   - Live product search, SKU lookup, and inline `+ Quick add` customer drawer.
   - Deterministic calculations down to the exact paisa (0.00 rounding drift).

2. **📜 CBIC Rule 46 Compliant Tax Invoices**:
   - Printable 3-copy layout (`Original for Recipient`, `Duplicate for Transporter`, `Triplicate for Supplier`).
   - Seller & Buyer GSTIN, State Code, Place of Supply, and reverse charge indicators.
   - Dynamic **UPI QR Code** (`upi://pay?pa=...`) for instant counter settlement via PhonePe, Google Pay, Paytm, or BHIM.
   - In-words currency spell-out (`numberToWordsIndian`).

3. **🏛️ Automatic Place of Supply (POS) Engine**:
   - Compares seller state code with buyer POS code.
   - Automatically switches between **Intra-State (CGST 50% + SGST 50%)** and **Inter-State (IGST 100%)**.
   - Universal multi-tax system support: **India GST**, **International VAT**, **Sales Tax**, or **Simple / No-Tax**.

4. **📑 Direct GSTR-1 JSON Filing Generator**:
   - Pre-compiles outward supplies into official GST portal schema:
     - **Table 4**: Taxable outward supplies to registered persons (B2B).
     - **Table 7**: Taxable outward supplies to unregistered persons (B2C Small).
     - **Table 12**: HSN-wise summary of outward supplies.
   - One-click `Download GSTR-1 JSON` for direct upload to `gst.gov.in` without third-party converters.

5. **📦 Inventory & Real-Time Stock Decrements**:
   - Auto-decrements inventory on invoice generation.
   - Restores stock automatically upon cancellation / credit note issuance.
   - Critical low stock watchlists and reorder point alerts.

6. **⏳ Receivables Aging & Collections**:
   - Buckets overdue bills into `0–30 days`, `31–60 days`, `61–90 days`, and `90+ days`.
   - Partial and full payment settlement modal.

7. **✨ "Ask Your Books" NLP Assistant**:
   - Natural language query interface with quick query chips:
     - *"Who hasn't paid me?"*
     - *"Sales this month"*
     - *"Top selling items"*
     - *"GST liability"*

8. **🔒 100% Offline-First & Zero-Lockin Portability**:
   - Client-side persistence in `localStorage`.
   - One-click full-state JSON export and restore.
   - Sales register CSV export.

---

## 🚀 How to Run

### Option 1: Double-Click Standalone (Zero-Setup)
Open `standalone.html` directly in any web browser (Chrome, Edge, Firefox, Brave):
```powershell
Start-Process "d:\billing_universal\standalone.html"
```

### Option 2: Full React + Vite App
```powershell
cd d:\billing_universal
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.
