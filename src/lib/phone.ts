/** Strip to up to 10 US national digits (drops a leading country code 1). */
export function parseUsPhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits.slice(0, 10);
}

/** Format for display and form submission: +1 (xxx) xxx-xxxx */
export function formatUsPhoneDisplay(digits: string): string {
  const d = parseUsPhoneDigits(digits);
  if (d.length === 0) {
    return "";
  }
  let formatted = "+1 ";
  formatted += `(${d.slice(0, 3)}`;
  if (d.length >= 3) {
    formatted += ")";
  }
  if (d.length > 3) {
    formatted += ` ${d.slice(3, 6)}`;
  }
  if (d.length > 6) {
    formatted += `-${d.slice(6, 10)}`;
  }
  return formatted;
}

/** Reformat while the customer types. */
export function formatUsPhoneInput(nextRaw: string, previousRaw: string): string {
  const nextDigits = parseUsPhoneDigits(nextRaw);
  const previousDigits = parseUsPhoneDigits(previousRaw);

  if (nextRaw.length < previousRaw.length && nextDigits === previousDigits) {
    return formatUsPhoneDisplay(previousDigits.slice(0, -1));
  }

  return formatUsPhoneDisplay(nextDigits);
}

export function isCompleteUsPhone(value: string): boolean {
  return parseUsPhoneDigits(value).length === 10;
}
