import { parseAmount } from './money';

describe('parseAmount', () => {
  it('понимает запятую и пробелы', () => {
    expect(parseAmount('12 500,50')).toBe(12500.5);
  });

  it('возвращает null для пустого и некорректного ввода', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('  ')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });
});
