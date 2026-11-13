export interface HsnItem {
  code: string;
  type: 'GOODS' | 'SERVICES';
  gstRate: number;
  description: string;
  category: string;
}

export const COMMON_HSN_DIRECTORY: HsnItem[] = [
  // Surveillance & Electronics
  { code: '8525', type: 'GOODS', gstRate: 18, description: 'Transmission apparatus for radio-broadcasting, CCTV / IP Cameras, Video recording equipment', category: 'Electronics' },
  { code: '8517', type: 'GOODS', gstRate: 18, description: 'Telephone sets, routers, wireless network modems, switches', category: 'Networking' },
  { code: '8471', type: 'GOODS', gstRate: 18, description: 'Automatic data processing machines, Laptops, Desktops, Servers', category: 'Computers' },
  { code: '8473', type: 'GOODS', gstRate: 18, description: 'Parts and accessories for computers, RAM modules, Motherboards', category: 'Components' },
  { code: '8544', type: 'GOODS', gstRate: 18, description: 'Insulated wire, Cat6 / Cat5e cables, optical fibre cables', category: 'Cabling' },
  { code: '8528', type: 'GOODS', gstRate: 18, description: 'Monitors, Projectors, Television receivers', category: 'Displays' },
  { code: '8504', type: 'GOODS', gstRate: 18, description: 'Electrical transformers, static converters (UPS, inverters, power adapters)', category: 'Power' },
  
  // Hardware & Construction
  { code: '7318', type: 'GOODS', gstRate: 18, description: 'Screws, bolts, nuts, coach screws, screw hooks, rivets, washers', category: 'Hardware' },
  { code: '6810', type: 'GOODS', gstRate: 28, description: 'Articles of cement, concrete or artificial stone, prefabricated elements', category: 'Construction' },
  { code: '2523', type: 'GOODS', gstRate: 28, description: 'Portland cement, aluminous cement, slag cement', category: 'Cement' },
  { code: '7214', type: 'GOODS', gstRate: 18, description: 'Iron or non-alloy steel bars and rods (TMT bars)', category: 'Steel' },

  // Electricals
  { code: '8536', type: 'GOODS', gstRate: 18, description: 'Electrical apparatus for switching, protecting circuits (MCB, relays, fuses)', category: 'Electrical' },
  { code: '9405', type: 'GOODS', gstRate: 12, description: 'Lamps and light fittings including LED bulbs, spotlights', category: 'Lighting' },

  // Food & Provisions
  { code: '1006', type: 'GOODS', gstRate: 5, description: 'Rice, pre-packaged and labelled', category: 'Groceries' },
  { code: '1101', type: 'GOODS', gstRate: 5, description: 'Wheat or meslin flour (Atta, Maida)', category: 'Groceries' },
  { code: '0402', type: 'GOODS', gstRate: 5, description: 'Milk and cream, concentrated or sweetened', category: 'Dairy' },
  { code: '1509', type: 'GOODS', gstRate: 5, description: 'Olive oil and edible vegetable cooking oils', category: 'Groceries' },

  // Services (SAC)
  { code: '9983', type: 'SERVICES', gstRate: 18, description: 'Information technology (IT) design, network engineering, consulting services', category: 'IT Services' },
  { code: '9987', type: 'SERVICES', gstRate: 18, description: 'Maintenance and repair services of commercial/office equipment', category: 'Repairs' },
  { code: '9954', type: 'SERVICES', gstRate: 18, description: 'General construction and civil contractor services', category: 'Construction Services' },
  { code: '9986', type: 'SERVICES', gstRate: 18, description: 'Support services to agriculture, hunting, forestry, fishing, mining', category: 'Support Services' },
  { code: '9982', type: 'SERVICES', gstRate: 18, description: 'Legal, accounting, auditing, bookkeeping and tax consultancy services', category: 'Professional Services' }
];

export function validateGstinChecksum(gstin: string): { valid: boolean; reason?: string } {
  if (!gstin) return { valid: false, reason: 'GSTIN cannot be empty' };
  const clean = gstin.trim().toUpperCase();

  if (clean.length !== 15) {
    return { valid: false, reason: 'GSTIN must be exactly 15 characters long' };
  }

  // Regex format: 2 digits (state), 5 letters (PAN), 4 digits, 1 letter (PAN status), 1 digit (entity), 'Z', 1 checksum char
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(clean)) {
    return { valid: false, reason: 'Invalid format. Expected: 22AAAAA0000A1Z5 pattern (CBIC)' };
  }

  // Check character algorithm according to GSTN standard
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let factor = 1;
  let sum = 0;
  const checkChar = clean[14];

  for (let i = 0; i < 14; i++) {
    const codePoint = chars.indexOf(clean[i]);
    if (codePoint === -1) return { valid: false, reason: 'Invalid character present' };

    let addend = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / 36) + (addend % 36);
    sum += addend;
  }

  const remainder = sum % 36;
  const calculatedCheckIndex = (36 - remainder) % 36;
  const calculatedChar = chars[calculatedCheckIndex];

  if (calculatedChar === checkChar) {
    return { valid: true };
  }

  return { 
    valid: false, 
    reason: `Checksum character mismatch (Expected ${calculatedChar}, found ${checkChar})` 
  };
}
