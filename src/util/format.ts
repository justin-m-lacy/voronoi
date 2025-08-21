type Numeric = number | { value: number }

/**
 * Returns abbreviation of item based on first letters.
 * @param {*} it
 */
export const abbr = (it?: { name?: string }) => {

  if (!it) return '';

  const s = it.name;
  if (!s) return it;

  const ind = s.indexOf(' ');
  if (ind > 0 && ind + 1 < s.length) return s[0] + s[ind + 1];
  return s.slice(0, 2);

}

/**
 * Returns number as integer if integer, or else precise.
 * @param v 
 */
export const smallNum = (v: Numeric) => {

  const val = typeof v === 'number' ? v : v.value;
  return (Math.floor(val) === val) ? val : precise(val);
}

/**
 * Format numeric value for display.
 * @param v - number to display.
 * @param n - maximum rounding digits to display.
 */
export const precise = (v: Numeric, n: number = 2): string => {

  if (typeof v === 'object') v = v.value;

  if (v === Math.floor(v)) return v.toFixed(n);

  const maxDivide = Math.pow(10, n);

  let abs = Math.abs(v);
  let divide = 1;

  while ((divide < maxDivide) && abs !== Math.floor(abs)) {

    abs *= 10;
    divide *= 10;

  }

  abs = Math.round(abs) / divide;
  return (v >= 0 ? abs : -abs).toFixed(2);

}
