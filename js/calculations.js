/**
 * Currency, Calculations & Number Helpers
 */

const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', locale: 'en-US' },
  IDR: { symbol: 'Rp', code: 'IDR', name: 'Indonesian Rupiah', locale: 'id-ID' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  SGD: { symbol: 'S$', code: 'SGD', name: 'Singapore Dollar', locale: 'en-SG' },
  AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP' },
};

/**
 * Format currency amount cleanly
 * e.g., $1,900.00 or Rp 1.900.000
 */
function formatCurrency(amount, currencyCode = 'USD') {
  const num = Number(amount) || 0;
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;

  if (curr.code === 'IDR' || curr.code === 'JPY') {
    return `${curr.symbol} ${Math.round(num).toLocaleString(curr.locale)}`;
  }

  return `${curr.symbol}${num.toLocaleString(curr.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculate totals from items, tax, and discount
 */
function calculateInvoiceTotals(items = [], taxPercent = 0, discountValue = 0, discountType = 'percent') {
  const subtotal = items.reduce((acc, item) => {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const discountAmount =
    discountType === 'percent'
      ? (subtotal * (Number(discountValue) || 0)) / 100
      : Number(discountValue) || 0;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * (Number(taxPercent) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
  };
}

/**
 * Terbilang generator for Indonesian Rupiah
 */
function angkaTerbilang(nilai) {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  const n = Math.floor(Math.abs(Number(nilai) || 0));

  function pembilang(angka) {
    if (angka < 12) return bilangan[angka];
    if (angka < 20) return pembilang(angka - 10) + ' Belas';
    if (angka < 100) return pembilang(Math.floor(angka / 10)) + ' Puluh ' + pembilang(angka % 10);
    if (angka < 200) return 'Seratus ' + pembilang(angka - 100);
    if (angka < 1000) return pembilang(Math.floor(angka / 100)) + ' Ratus ' + pembilang(angka % 100);
    if (angka < 2000) return 'Seribu ' + pembilang(angka - 1000);
    if (angka < 1000000) return pembilang(Math.floor(angka / 1000)) + ' Ribu ' + pembilang(angka % 1000);
    if (angka < 1000000000) return pembilang(Math.floor(angka / 1000000)) + ' Juta ' + pembilang(angka % 1000000);
    if (angka < 1000000000000) return pembilang(Math.floor(angka / 1000000000)) + ' Miliar ' + pembilang(angka % 1000000000);
    return pembilang(Math.floor(angka / 1000000000000)) + ' Triliun ' + pembilang(angka % 1000000000000);
  }

  if (n === 0) return 'Nol Rupiah';
  return (pembilang(n) + ' Rupiah').replace(/\s+/g, ' ').trim();
}

window.InvoiceCalc = {
  CURRENCIES,
  formatCurrency,
  calculateInvoiceTotals,
  angkaTerbilang,
};
