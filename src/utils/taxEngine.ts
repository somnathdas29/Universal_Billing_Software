export const INDIAN_STATES = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' },
];

export const GST_SLABS = [0, 5, 12, 18, 28];
export const UOM_LIST = ['PCS', 'BOX', 'MTR', 'KGS', 'NOS', 'SET', 'BAG', 'PKT', 'LTR', 'HRS', 'DAYS'];

export function getStateFromGstin(gstin: string): { code: string; name: string } | null {
  if (!gstin || gstin.trim().length < 2) return null;
  const code = gstin.trim().substring(0, 2);
  const match = INDIAN_STATES.find(s => s.code === code);
  return match || null;
}

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) amount = 0;
  
  // Format with standard Indian numbering or international numbering depending on symbol
  if (symbol === '₹') {
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toFixed(2);
    const [intPart, decPart] = absVal.split('.');
    
    // Indian comma format: 12,34,567.89
    let lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return `${isNegative ? '-' : ''}${symbol}${formattedInt}.${decPart}`;
  }

  // International standard format
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function numberToWordsIndian(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = num.toFixed(2).split('.');
  let integerPart = parseInt(n[0], 10);
  const paisePart = parseInt(n[1], 10);

  if (integerPart === 0 && paisePart === 0) return 'Zero Rupees Only';

  function inWords(val: number): string {
    let str = '';
    if (val >= 10000000) {
      str += inWords(Math.floor(val / 10000000)) + 'Crore ';
      val %= 10000000;
    }
    if (val >= 100000) {
      str += inWords(Math.floor(val / 100000)) + 'Lakh ';
      val %= 100000;
    }
    if (val >= 1000) {
      str += inWords(Math.floor(val / 1000)) + 'Thousand ';
      val %= 1000;
    }
    if (val >= 100) {
      str += inWords(Math.floor(val / 100)) + 'Hundred ';
      val %= 100;
    }
    if (val > 0) {
      if (val < 20) {
        str += a[val];
      } else {
        str += b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : ' ');
      }
    }
    return str;
  }

  let words = inWords(integerPart).trim() + ' Rupees';
  if (paisePart > 0) {
    words += ' and ' + inWords(paisePart).trim() + ' Paise';
  }
  return words + ' Only';
}

/**
 * Generate UPI payment link string for dynamic QR:
 * upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn={invoiceRef}
 */
export function generateUpiUrl(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  invoiceNumber: string;
}): string {
  if (!params.upiId) return '';
  const cleanVpa = encodeURIComponent(params.upiId.trim());
  const cleanPn = encodeURIComponent(params.payeeName.trim());
  const cleanAm = params.amount.toFixed(2);
  const note = encodeURIComponent(`Bill ${params.invoiceNumber}`);
  return `upi://pay?pa=${cleanVpa}&pn=${cleanPn}&am=${cleanAm}&cu=INR&tn=${note}`;
}
