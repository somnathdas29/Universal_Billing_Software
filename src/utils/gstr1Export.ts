import { Invoice, CompanySettings } from '../types';

export function generateGstr1Json(company: CompanySettings, invoices: Invoice[]) {
  // Filter active, non-cancelled invoices
  const activeInvoices = invoices.filter(i => i.status !== 'CANCELLED');

  // Table 4: B2B Invoices (Registered buyers with valid GSTIN)
  const b2bInvoices = activeInvoices.filter(i => i.customerTaxNumber && i.customerTaxNumber.trim().length >= 10);
  
  // Group B2B by customer GSTIN
  const b2bGrouped: Record<string, any[]> = {};
  for (const inv of b2bInvoices) {
    const ctin = inv.customerTaxNumber!.trim().toUpperCase();
    if (!b2bGrouped[ctin]) b2bGrouped[ctin] = [];
    
    b2bGrouped[ctin].push({
      inum: inv.invoiceNumber,
      idt: inv.invoiceDate.split('-').reverse().join('-'), // DD-MM-YYYY format for GSTN
      val: inv.grandTotal,
      pos: inv.placeOfSupplyCode,
      rchrg: inv.reverseCharge ? 'Y' : 'N',
      inv_typ: 'R',
      itms: inv.items.map((item, idx) => ({
        num: idx + 1,
        itm_det: {
          rt: item.taxRate,
          txval: item.taxableAmount,
          iamt: item.igstAmount || 0,
          camt: item.cgstAmount || 0,
          samt: item.sgstAmount || 0,
          csamt: 0,
        },
      })),
    });
  }

  const b2b = Object.keys(b2bGrouped).map(ctin => ({
    ctin,
    inv: b2bGrouped[ctin],
  }));

  // Table 7: B2C Small (Unregistered customers or without GSTIN)
  const b2csInvoices = activeInvoices.filter(i => !i.customerTaxNumber || i.customerTaxNumber.trim().length < 10);
  
  // Group B2CS by POS, Tax Rate, and Type
  const b2csMap: Record<string, { pos: string; rt: number; txval: number; iamt: number; camt: number; samt: number }> = {};
  for (const inv of b2csInvoices) {
    for (const item of inv.items) {
      const key = `${inv.placeOfSupplyCode}_${item.taxRate}`;
      if (!b2csMap[key]) {
        b2csMap[key] = {
          pos: inv.placeOfSupplyCode,
          rt: item.taxRate,
          txval: 0,
          iamt: 0,
          camt: 0,
          samt: 0,
        };
      }
      b2csMap[key].txval += item.taxableAmount;
      b2csMap[key].iamt += item.igstAmount || 0;
      b2csMap[key].camt += item.cgstAmount || 0;
      b2csMap[key].samt += item.sgstAmount || 0;
    }
  }

  const b2cs = Object.values(b2csMap).map(row => ({
    sply_ty: row.pos === company.stateCode ? 'INTRA' : 'INTER',
    pos: row.pos,
    typ: 'OE',
    rt: row.rt,
    txval: Math.round(row.txval * 100) / 100,
    iamt: Math.round(row.iamt * 100) / 100,
    camt: Math.round(row.camt * 100) / 100,
    samt: Math.round(row.samt * 100) / 100,
    csamt: 0,
  }));

  // Table 12: HSN Summary of outward supplies
  const hsnMap: Record<string, {
    hsn_sc: string;
    desc: string;
    uqc: string;
    qty: number;
    val: number;
    txval: number;
    iamt: number;
    camt: number;
    samt: number;
  }> = {};

  for (const inv of activeInvoices) {
    for (const item of inv.items) {
      const hsn = item.hsnSacCode || '9999';
      if (!hsnMap[hsn]) {
        hsnMap[hsn] = {
          hsn_sc: hsn,
          desc: item.description.substring(0, 30),
          uqc: item.uom || 'OTH',
          qty: 0,
          val: 0,
          txval: 0,
          iamt: 0,
          camt: 0,
          samt: 0,
        };
      }
      hsnMap[hsn].qty += item.quantity;
      hsnMap[hsn].txval += item.taxableAmount;
      hsnMap[hsn].val += item.lineTotal;
      hsnMap[hsn].iamt += item.igstAmount || 0;
      hsnMap[hsn].camt += item.cgstAmount || 0;
      hsnMap[hsn].samt += item.sgstAmount || 0;
    }
  }

  const hsn = {
    data: Object.values(hsnMap).map((row, idx) => ({
      num: idx + 1,
      hsn_sc: row.hsn_sc,
      desc: row.desc,
      uqc: row.uqc,
      qty: row.qty,
      val: Math.round(row.val * 100) / 100,
      txval: Math.round(row.txval * 100) / 100,
      iamt: Math.round(row.iamt * 100) / 100,
      camt: Math.round(row.camt * 100) / 100,
      samt: Math.round(row.samt * 100) / 100,
      csamt: 0,
    })),
  };

  // Standard official GST Portal GSTR-1 JSON schema root
  const gstr1Payload = {
    gstin: company.taxNumber,
    fp: '102026', // MMYYYY period
    gt: 1000000.00,
    cur_gt: 1000000.00,
    b2b,
    b2cs,
    hsn,
  };

  return gstr1Payload;
}

export function downloadGstr1JsonFile(company: CompanySettings, invoices: Invoice[]) {
  const data = generateGstr1Json(company, invoices);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GSTR1_${company.taxNumber || 'DATA'}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
