import { Request, Response } from "express";
import {
  assignLeadService,
  convertLeadToLoanApplicationService,
  createLeadService,
  getAllLeadsService,
  getLeadByIdService,
  updateLeadStatusService,
} from "./lead.service.js";

export const createLeadController = async (req: Request, res: Response) => {
  try {
    const leadData = req.body;
    const lead = await createLeadService(leadData);
    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead, // return created lead data
    });
  } catch (error: any) {
      if(error.name === "ValidationError"){
          return res.status(400).json({
              success: false,
              message: "Invalid lead data",
              error: error.message,
          });
      }
      
          
    res.status(500).json({
      success: false,
      message: "Lead creation failed",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const convertLeadToLoanController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

       if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Invalid lead ID provided",
    });
  }
    const loan = await convertLeadToLoanApplicationService(id);

    res.status(200).json({
      success: true,
      message: "Lead converted to loan application successfully",
      data: loan, // return converted loan application data
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Conversion failed",
    });
  }
};

export const getAllLeadsController = async (req: Request, res: Response) => {
  try {
    const leads = await getAllLeadsService();
    res.status(200).json({
      success: true,
      message: "Leads retrieved successfully",
      data: leads, // return array of leads
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve leads",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getLeadByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = await getLeadByIdService(id);
    res.status(200).json({
      success: true,
      message: "Lead retrieved successfully",
      data: lead, // return lead data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lead",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
export const updateLeadStatusController = async (
  req: Request,
    res: Response
) => {
  try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedLead = await updateLeadStatusService(id, status);
      res.status(200).json({
          success: true,
          message: "Lead status updated successfully",
          data: updatedLead,
      });
  } catch (error: any) {
      res.status(400).json({
          success: false,
          message: "Failed to update lead status",
          error: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
};
export const assignLeadController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    // assignedBy comes from authenticated user injected into req.user
    const assignedBy = req.user?.id;
    if (!assignedBy) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const lead = await assignLeadService(id, assignedTo, assignedBy);

    // remove sensitive fields (password) from nested user objects before returning
    const sanitized: any = JSON.parse(JSON.stringify(lead));
    if (sanitized.assignedToUser) delete sanitized.assignedToUser.password;
    if (sanitized.assignedByUser) delete sanitized.assignedByUser.password;

    res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: sanitized,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Lead assignment failed",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
};
