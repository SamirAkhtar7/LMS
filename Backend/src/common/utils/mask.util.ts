export function maskAadhaar(aadhaar?: string | null): string | null {
  if (!aadhaar) return null;

  const last4 = aadhaar.slice(-4); // get last 4 digits
  const masked = last4.padStart(aadhaar.length, "*"); // pad the rest with *

  return masked;
}
export function maskPan(pan?: string | null) {
  if (!pan) return null;
  return pan.replace(/^(.{5}).*(.{1})$/, "$1****$2");
}

export function maskAccountNumber(account?: string | null) {
  if (!account) return null;
  return account.replace(/^(\d{0}).*(\d{4})$/, "$1******$2");
}

export function maskSensitive(input: any): any {
  if (input == null) return input;
  if (Array.isArray(input)) return input.map(maskSensitive);
  if (typeof input !== "object") return input;

  const out: any = {};
  for (const [key, val] of Object.entries(input)) {
    if (val == null) {
      out[key] = val;
      continue;
    }
    if (typeof val === "string") {
      const k = key.toLowerCase();
      if (
        k.includes("aadhaar") ||
        k.includes("aadhaar_number") ||
        k === "aadhaar"
      ) {
        out[key] = maskAadhaar(val as string);
        continue;
      }
      if (k.includes("pan")) {
        out[key] = maskPan(val as string);
        continue;
      }
      if (
        k.includes("account") ||
        k.includes("bankaccount") ||
        k.includes("accountnumber")
      ) {
        out[key] = maskAccountNumber(val as string);
        continue;
      }
      out[key] = val;
      continue;
    }
    out[key] = maskSensitive(val);
  }
  return out;
}
