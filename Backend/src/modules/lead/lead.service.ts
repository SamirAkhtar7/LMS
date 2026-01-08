import { prisma } from "../../db/prismaService.js";
import { CreateLead, UpdateLead } from "./lead.types.js";

export const createLeadService = async (leadData: CreateLead) => {
  const dob =
    typeof leadData.dob === "string" ? new Date(leadData.dob) : leadData.dob;
  try {
    const typecheck = await prisma.loanType.findFirst
      ({
        where: {
          id: leadData.loanTypeId,
          isActive: true,
          //deletedAt: null,
        },
        select:{ id: true}
        
      })
    if (!typecheck) {
      const e: any = new Error("Invalid loan type ID");
      e.statusCode = 400;
      throw e;
    }
const result = await prisma.leads.create({
    data: {
      fullName: leadData.fullName,
      contactNumber: leadData.contactNumber,
      email: leadData.email,
      dob,
      gender: leadData.gender,
      loanAmount: leadData.loanAmount,
      loanTypeId: leadData.loanTypeId,
      city: leadData.city,
      state: leadData.state,
      pinCode: leadData.pinCode,
      address: leadData.address,
      status: (leadData.status ?? "PENDING") as any,
    },
});
  
  return result;
 
} catch (error: any) {
  throw new Error(error.message);
}
};

export const getAllLeadsService = async () => {
  const leads = await prisma.leads.findMany({include: { loanType: true }});
  return leads;
};

export const getLeadByIdService = async (id: string) => {
  const lead = await prisma.leads.findUnique({
    where: { id },
    include: {
      loanType: true,
    },
  });
  if (lead) {
    return lead;
  }
  throw new Error("Lead not found");
};

export const updateLeadStatusService = async (id: string, status: string) => {
  const allowed = [
    "CONTACTED",
    "INTERESTED",
    "APPLICATION_IN_PROGRESS",
    "APPLICATION_SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "FUNDED",
    "CLOSED",
    "DROPPED",
    "PENDING",
  ];
  const normalized =
    typeof status === "string" ? status.toUpperCase().trim() : status;
  if (!allowed.includes(normalized)) {
    const e: any = new Error(
      `Invalid status. Expected one of: ${allowed.join("|")}`
    );
    e.statusCode = 400;
    throw e;
  }

  try {
    const updatedLead = await prisma.leads.update({
      where: { id },
      data: { status: normalized as any },
      include: { loanType: true },
    });
    return updatedLead;
  } catch (error: unknown) {
    const eAny = error as any;
    // record not found
    if (eAny && eAny.code === "P2025") {
      const e: any = new Error("Lead not found");
      e.statusCode = 404;
      throw e;
    }
    throw error;
  }
};

export const assignLeadService = async (
  id: string,
  assignedTo: string,
  assignedBy: string
) => {
  try {
    const updated = await prisma.leads.update({
      where: { id },
      data: { assignedTo, assignedBy },
      include: { assignedToUser: true, assignedByUser: true ,include: { loanType: true }},
    });
    return updated;
  } catch (error: unknown) {
    const eAny = error as any;
    if (eAny && eAny.code === "P2025") {
      const e: any = new Error("Lead not found");
      e.statusCode = 404;
      throw e;
    }
    throw error;
  }
};

export const convertLeadToLoanApplicationService = async (leadId: string) => {
  return prisma.$transaction(async (tx) => {
    const lead = await tx.leads.findUnique({ where: { id: leadId } });
    if (!lead) {
      const e: any = new Error("Lead not found");
      e.statusCode = 404;
      throw e;
    }

    if (lead.convertedLoanApplicationId) {
      const e: any = new Error("Lead already converted to loan application");
      e.statusCode = 400;
      throw e;
    }

    if (
      !["APPLICATION_IN_PROGRESS", "INTERESTED", "APPROVED"].includes(
        lead.status
      )
    ) {
      const e: any = new Error("Lead status not eligible for conversion");
      e.statusCode = 400;
      throw e;
    }

    // 1. Try to find an existing customer by email or contact number
    const orConditions = [
      lead.email ? { email: lead.email } : undefined,
      lead.contactNumber ? { contactNumber: lead.contactNumber } : undefined,
    ].filter(Boolean) as object[];

    if (orConditions.length === 0) {
      const e: any = new Error(
        "Lead must have email or contact number to convert"
      );
      e.statusCode = 400;
      throw e;
    }

    let customer = await tx.customer.findFirst({
      where: {
        OR: orConditions,
      },
    });
    // 2. Create customer if not found (use conservative defaults for required fields)
    if (!customer) {
      const names = (lead.fullName || "").trim().split(/\s+/);
      const firstName = names.shift() || "Unknown";
      const lastName = names.length ? names.join(" ") : "";
      const titleFromGender =
        lead.gender === "FEMALE" ? "MS" : lead.gender === "MALE" ? "MR" : "MR";

      try {
        customer = await tx.customer.create({
          data: {
            title: titleFromGender as any,
            firstName,
            lastName,
            gender: lead.gender as any,
            dob: lead.dob as Date,
            contactNumber: lead.contactNumber,
            address: lead.address ?? "",
            city: lead.city ?? "",
            state: lead.state ?? "",
            pinCode: lead.pinCode ?? "",
            employmentType: "salaried" as any,
            status: "ACTIVE",
            email: lead.email ?? undefined,
          },
        });
      } catch (err: unknown) {
        const eAny = err as any;
        if (eAny?.code === "P2002") {
          const requery = await tx.customer.findFirst({
            where: {
              OR: [
                lead.email ? { email: lead.email } : undefined,
                lead.contactNumber
                  ? { contactNumber: lead.contactNumber }
                  : undefined,
              ].filter(Boolean) as object[],
            },
          });
          if (requery) {
            customer = requery;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    // 3. Create the loan application and associate it with the customer and lead
    const loanApplication = await tx.loanApplication.create({
      data: {
        requestedAmount: lead.loanAmount,
        interestType: "FLAT",
        status: "application_in_progress",
        customer: { connect: { id: customer.id } },
        lead: { connect: { id: lead.id } },
      },
      include: { customer: true },
    });

    // 4. Mark lead as converted
    await tx.leads.update({
      where: { id: lead.id },
      data: { convertedLoanApplicationId: loanApplication.id },
    });

    return loanApplication;
  });
};
