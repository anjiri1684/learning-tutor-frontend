// Prices come from the API in their own currency (Language.Currency,
// Bundle.Currency; default USD). The backend charges M-Pesa/Paystack in KES:
// KES prices as-is, anything else converted and rounded to whole shillings.
// These helpers mirror that so the amount shown matches the amount charged.

export const isKES = (currency?: string) => (currency || 'USD').toUpperCase() === 'KES';

export const toKES = (price: number, currency: string | undefined, usdToKesRate: number | null | undefined) => {
  if (!price) return 0;
  if (isKES(currency)) return price;
  return usdToKesRate ? Math.round(price * usdToKesRate) : 0;
};

export const formatPrice = (price: number, currency?: string) => {
  const code = (currency || 'USD').toUpperCase();
  const amount = (price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return code === 'USD' ? `$${amount}` : `${code} ${amount}`;
};
