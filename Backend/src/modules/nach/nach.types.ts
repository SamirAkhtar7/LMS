export interface CreateNachMandateInput {
    loanApplicationId: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    startDate: Date;
    endDate: Date;
    frequency: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY";
    amount: number;
}