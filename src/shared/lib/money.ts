const formatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
});

/** Форматирует сумму с разделителями разрядов, например «12 500,5». */
export function formatAmount(value: number): string {
  return formatter.format(value);
}

/**
 * Разбирает ввод пользователя в сумму: допускает пробелы и запятую
 * как десятичный разделитель. Пустая строка или мусор → null.
 */
export function parseAmount(input: string): number | null {
  const normalized = input.replace(/\s/g, '').replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
