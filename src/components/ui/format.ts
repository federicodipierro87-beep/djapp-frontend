const eur = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// `compact` toglie i decimali agli importi tondi: "5 €" invece di "5,00 €".
const eurCompact = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number, compact = false): string {
  return (compact ? eurCompact : eur).format(value);
}
