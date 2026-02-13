export function formatToBRLCurrency(
  value: number,
  locale: Intl.LocalesArgument = "pt-BR"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatBRLFromCents(
  amountCents: number,
  currency: Intl.NumberFormatOptions["currency"] = "BRL",
  locale: Intl.LocalesArgument = "pt-BR"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}
