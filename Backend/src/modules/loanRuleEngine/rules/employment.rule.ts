export const employmentRule = (
  employmentStatus: string,
  allowedStatuses: string[],
) => {
  const normalizedStatus = employmentStatus.toLowerCase();
  const normalizedAllowed = allowedStatuses.map((s) => s.toLowerCase());
  if (!normalizedAllowed.includes(normalizedStatus)) {
    return {
      passed: false,
      reason: `Applicant's employment status of ${employmentStatus} is not eligible. Allowed statuses are: ${allowedStatuses.join(", ")}`,
    };
  }
  return {
    passed: true,
    reason: `Applicant's employment status of ${employmentStatus} is eligible.`,
  };
};
