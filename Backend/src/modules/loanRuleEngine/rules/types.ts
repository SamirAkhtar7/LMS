

export type RuleResult = {
  rule: string; // Rule code (AUDIT / LOGGING)
  passed: boolean; // true = rule passed
  reason?: string; // populated ONLY when failed
};
