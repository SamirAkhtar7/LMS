export const employmentRule = (
    employmentStatus: string,
    allowedStatuses: string[]

) => {
    if(!allowedStatuses.includes(employmentStatus)) {
        return {
            passed: false,
            reason: `Applicant's employment status of ${employmentStatus} is not eligible. Allowed statuses are: ${allowedStatuses.join(', ')}`
        }
    }
    return { passed: true,reason: `Applicant's employment status of ${employmentStatus} is eligible.` };
}