import { prisma } from "../../db/prismaService.js";
import { CreateLead, UpdateLead } from "./lead.types.js";

export const createLeadService = async (leadData: CreateLead) => {
  const dob =
    typeof leadData.dob === "string" ? new Date(leadData.dob) : leadData.dob;

  return prisma.leads.create({
    data: {
      fullName: leadData.fullName,
      contactNumber: leadData.contactNumber,
      email: leadData.email,
      dob,
      gender: leadData.gender,
      loanAmount: leadData.loanAmount,
      loanType: leadData.loanType,
      city: leadData.city,
      state: leadData.state,
      pinCode: leadData.pinCode,
      address: leadData.address,
      status: (leadData.status ?? "PENDING") as any,
    },
  });
};

export const getAllLeadsService = async () => {
  const leads = await prisma.leads.findMany();
  return leads;
};

export const getLeadByIdService = async (id: string) => {
  const lead = await prisma.leads.findUnique({
    where: { id },
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
      include: { assignedToUser: true, assignedByUser: true },
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
