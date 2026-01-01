import { prisma } from "../../db/prismaService.js";
import { CreateLoanApplication } from "./loanApplication.types.js";
import createLoanApplicationSchema from "./loanApplication.schema.js";
import type { Prisma } from "../../../generated/prisma-client/client.js";
import type * as Enums from "../../../generated/prisma-client/enums.js";
// cleaned imports

// export const createLoanApplicationService = async (
//   loanData: CreateLoanApplication
// ) => {
//   const parsed = createLoanApplicationSchema.parse(loanData as any);

//   try {
//     // loanProductId removed — do not validate or attach loan product here

//     // Ensure dob on customer (if present) is a Date
//     const customerPayload = parsed.customer
//       ? {
//           ...parsed.customer,
//           dob: parsed.customer.dob ? new Date(parsed.customer.dob) : undefined,
//         }
//       : undefined;

//     // Find existing customer by identifiers
//     const existingCustomer = await prisma.customer.findFirst({
//       where: {
//         OR: [
//           parsed.customer?.panNumber
//             ? { panNumber: parsed.customer.panNumber }
//             : undefined,
//           parsed.customer?.aadhaarNumber
//             ? { aadhaarNumber: parsed.customer.aadhaarNumber }
//             : undefined,
//           parsed.customer?.contactNumber
//             ? { contactNumber: parsed.customer.contactNumber }
//             : undefined,
//         ].filter(Boolean) as object[],
//       },
//     });

//     let customer = existingCustomer;
//     if (!customer) {
//       if (!customerPayload) {
//         const err = new Error(
//           "Customer details missing and customer not found"
//         );
//         (err as any).statusCode = 400;
//         throw err;
//       }

//       // Build create data only with defined properties to satisfy TS and Prisma
//       const customerCreateData: Record<string, any> = {
//         title: customerPayload.title,
//         firstName: customerPayload.firstName,
//         contactNumber: customerPayload.contactNumber,
//         employmentType: customerPayload.employmentType as any,
//         status: "ACTIVE",
//       };

//       if (customerPayload.lastName)
//         customerCreateData.lastName = customerPayload.lastName;
//       if (customerPayload.middleName)
//         customerCreateData.middleName = customerPayload.middleName;
//       if (customerPayload.gender)
//         customerCreateData.gender = customerPayload.gender;
//       if (customerPayload.dob)
//         customerCreateData.dob = customerPayload.dob as Date;
//       if (customerPayload.aadhaarNumber)
//         customerCreateData.aadhaarNumber = customerPayload.aadhaarNumber;
//       if (customerPayload.panNumber)
//         customerCreateData.panNumber = customerPayload.panNumber;
//       if (customerPayload.alternateNumber)
//         customerCreateData.alternateNumber = customerPayload.alternateNumber;
//       if (customerPayload.email)
//         customerCreateData.email = customerPayload.email;
//       if (customerPayload.address)
//         customerCreateData.address = customerPayload.address;
//       if (customerPayload.city) customerCreateData.city = customerPayload.city;
//       if (customerPayload.state)
//         customerCreateData.state = customerPayload.state;
//       if (customerPayload.pinCode)
//         customerCreateData.pinCode = customerPayload.pinCode;
//       if (customerPayload.monthlyIncome !== undefined)
//         customerCreateData.monthlyIncome = customerPayload.monthlyIncome;
//       if (customerPayload.annualIncome !== undefined)
//         customerCreateData.annualIncome = customerPayload.annualIncome;

//       customer = await prisma.customer.create({
//         data: customerCreateData as Prisma.CustomerUncheckedCreateInput,
//       });
//     }

//     // Build loan data dynamically to avoid assigning undefined where Prisma expects values
//     const loanCreateData: Record<string, any> = {
//       requestedAmount: parsed.requestedAmount,
//     };

//     // attach relations via nested connect to satisfy Prisma's expected shape
//     loanCreateData.customer = { connect: { id: customer.id } };
//     // loanProduct association intentionally omitted

//     const status = (parsed as any).status ?? "application_in_progress";
//     loanCreateData.status = status;

//     if ((parsed as any).approvedAmount !== undefined)
//       loanCreateData.approvedAmount = (parsed as any).approvedAmount;
//     if (parsed.tenureMonths !== undefined)
//       loanCreateData.tenureMonths = parsed.tenureMonths;
//     if (parsed.interestRate !== undefined)
//       loanCreateData.interestRate = parsed.interestRate;
//     // default interest type to 'flat' when missing
//     loanCreateData.interestType = parsed.interestType ?? "flat";
//     if (parsed.emiAmount !== undefined)
//       loanCreateData.emiAmount = parsed.emiAmount;
//     if (parsed.totalPayable !== undefined)
//       loanCreateData.totalPayable = parsed.totalPayable;
//     if (parsed.loanPurpose !== undefined)
//       loanCreateData.loanPurpose = parsed.loanPurpose;
//     if (parsed.cibilScore !== undefined)
//       loanCreateData.cibilScore = parsed.cibilScore;

//     const loanApplication = await prisma.loanApplication.create({
//       data: loanCreateData as Prisma.LoanApplicationUncheckedCreateInput,
//       include: {
//         customer: true,
//         // product: true,
//         // documents: true,
//         // approvals: true,
//         // disbursements: true,
//         // emis: true,
//         // payments: true,
//         // charges: true,
//         // statusHistory: true,
//         // nachMandates: true,
//       },
//     });

//     return loanApplication;
//   } catch (error) {
//     // wrap or rethrow for upstream handler
//     throw error;
//   }
// };

export async function createLoanApplicationService(
  data: CreateLoanApplication
) {
  const parsed = createLoanApplicationSchema.parse(data as any);

  // 1. Normalize DOB
  const dob =
    parsed.dob && typeof parsed.dob === "string"
      ? new Date(parsed.dob)
      : parsed.dob;

  // 2. Find existing customer
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        parsed.panNumber ? { panNumber: parsed.panNumber } : undefined,
        parsed.aadhaarNumber
          ? { aadhaarNumber: parsed.aadhaarNumber }
          : undefined,
        parsed.contactNumber
          ? { contactNumber: parsed.contactNumber }
          : undefined,
      ].filter(Boolean) as object[],
    },
  });

  try {
    // 3. Create customer if not exists
    let customer = existingCustomer;

    if (!customer) {
      try {
        customer = await prisma.customer.create({
          data: {
            title: parsed.title as unknown as Enums.Title,
            firstName: parsed.firstName as string,
            lastName: parsed.lastName as string,
            middleName: parsed.middleName ?? undefined,
            gender: parsed.gender as unknown as Enums.Gender,
            dob: dob as Date,
            aadhaarNumber: parsed.aadhaarNumber ?? undefined,
            panNumber: parsed.panNumber ?? undefined,
            contactNumber: parsed.contactNumber as string,
            alternateNumber: parsed.alternateNumber ?? undefined,
            employmentType:
              parsed.employmentType as unknown as Enums.EmploymentType,
            monthlyIncome: parsed.monthlyIncome ?? undefined,
            annualIncome: parsed.annualIncome ?? undefined,
            email: parsed.email ?? undefined,
            address: parsed.address as string,
            city: parsed.city as string,
            state: parsed.state as string,
            pinCode: parsed.pinCode as string,
            status: "ACTIVE",
          },
        });
      } catch (err: unknown) {
        const eAny = err as any;
        if (eAny?.code === "P2002") {
          // Unique constraint violation likely due to a concurrent create — re-query the customer
          const requery = await prisma.customer.findFirst({
            where: {
              OR: [
                parsed.panNumber ? { panNumber: parsed.panNumber } : undefined,
                parsed.aadhaarNumber
                  ? { aadhaarNumber: parsed.aadhaarNumber }
                  : undefined,
                parsed.contactNumber
                  ? { contactNumber: parsed.contactNumber }
                  : undefined,
              ].filter(Boolean) as object[],
            },
          });

          if (requery) {
            customer = requery;
          } else {
            // If we couldn't find the conflicting record, rethrow the original error
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    // 4. Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        requestedAmount: parsed.requestedAmount,
        tenureMonths: parsed.tenureMonths,
        interestRate: parsed.interestRate,
        interestType: parsed.interestType ?? "flat",
        loanPurpose: parsed.loanPurpose,
        cibilScore: parsed.cibilScore,
        status: "application_in_progress",
        customer: {
          connect: { id: customer.id },
        },
      },
      include: {
        customer: true,
      },
    });

    return loanApplication;
  } catch (error: unknown) {
    const eAny = error as any;

    if (eAny?.code === "P2002") {
      const e: any = new Error("Duplicate loan application");
      e.statusCode = 409;
      throw e;
    }
    throw error;
  }
}

export const getAllLoanApplicationsService = async () => {
  // Implementation for retrieving all loan applications
  try {
    const loanApplications = await prisma.loanApplication.findMany({
      include: {
        customer: true,
      },
    });
    return loanApplications;
  } catch (error) {
    throw error;
  }

};
export const getLoanApplicationByIdService = async (id: string) => {
  // Implementation for retrieving a loan application by ID
  try {
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });
    return loanApplication;
  } catch (error) {
    throw error;
  }

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
