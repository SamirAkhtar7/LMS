export const incomeRule = (
    monthlyIncome: number,
    minIncome: number
) => {
    if (monthlyIncome < minIncome) {
        return {
            passed: false,
            reason: `Applicant's monthly income of ${monthlyIncome} is below the minimum required income of ${minIncome}`
        }
    }
    return { passed: true,reason: `Applicant's monthly income of ${monthlyIncome} is above the minimum required income of ${minIncome}` };
}