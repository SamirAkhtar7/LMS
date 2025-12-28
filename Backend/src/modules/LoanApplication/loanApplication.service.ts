import { prisma } from "../../db/prismaService.js";


export const createLoanApplicationService = async (loanData: any) => {
  // Implementation for creating a loan application
  try {
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { panNumber: loanData.panNumber },
          { aadhaarNumber: loanData.aadhaarNumber },
          { contactNumber: loanData.contactNumber },
        ],
      },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          title: loanData.title ,
          firstName: loanData.firstName,
          lastName: loanData.lastName ?? "",
          middleName: loanData.middleName ?? "",
          gender: loanData.gender,
          dob: loanData.dob,
          aadhaarNumber: loanData.aadhaarNumber,
          panNumber: loanData.panNumber,
          voterId: loanData.voterId ?? "",
          passportNumber: loanData.passportNumber ?? "",
          contactNumber: loanData.contactNumber,
          alternateNumber: loanData.alternateNumber ?? "",
          email: loanData.email,
          address: loanData.address,
          city: loanData.city,
          state: loanData.state,
          pinCode: loanData.pinCode,
          employmentType: loanData.employmentType,
          monthlyIncome: loanData.monthlyIncome,
          annualIncome: loanData.annualIncome,
          bankName: loanData.bankName ?? "",
          bankAccountNumber: loanData.bankAccountNumber ?? "",
          ifscCode: loanData.ifscCode ?? "",
          status: "ACTIVE",
        },
      });
    }

    const loanApplication = await prisma.loanApplication.create({
      data: {
        customerId: customer.id,
        loanProductId: loanData.loanProductId,
        requestedAmount: loanData.requestedAmount,
        approvedAmount:
          typeof loanData.approvedAmount === "number"
            ? loanData.approvedAmount
            : undefined,
        tenureMonths:
          typeof loanData.tenureMonths === "number"
            ? loanData.tenureMonths
            : undefined,
        interestRate:
          typeof loanData.interestRate === "number"
            ? loanData.interestRate
            : undefined,
        interestType: (loanData.interestType ?? "flat") as any,
        emiAmount:
          typeof loanData.emiAmount === "number"
            ? loanData.emiAmount
            : undefined,
        totalPayable:
          typeof loanData.totalPayable === "number"
            ? loanData.totalPayable
            : undefined,
        loanPurpose: loanData.loanPurpose ?? undefined,
        cibilScore:
          typeof loanData.cibilScore === "number"
            ? loanData.cibilScore
            : undefined,
        status: (loanData.status ?? "application_in_progress") as any,
      },
      include: {
        customer: true,
        product: true,
        documents: true,
        approvals: true,
        disbursements: true,
        emis: true,
        payments: true,
        charges: true,
        statusHistory: true,
        nachMandates: true,
      },
    });

    return loanApplication;
  } catch (error) {
    throw error;
  }
  return {}; // return created loan application data
};

export const getAllLoanApplicationsService = async () => {
  // Implementation for retrieving all loan applications
  try {
    // Simulate retrieval logic
  } catch (error) {
    throw error;
  }
  return []; // return array of loan applications
};
export const getLoanApplicationByIdService = async (id: string) => {
  // Implementation for retrieving a loan application by ID
  try {
    // Simulate retrieval logic
  } catch (error) {
    throw error;
  }
  return {}; // return loan application data
};
export const updateLoanApplicationStatusService = async (
  id: string,
  statusData: any
) => {
  // Implementation for updating loan application status
  try {
    // Simulate update logic
  } catch (error) {
    throw error;
  }
  return {}; // return updated loan application data
};
