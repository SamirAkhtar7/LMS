import { Response, Request } from "express";
import {createLoanApplicationService,
        getAllLoanApplicationsService,
  getLoanApplicationByIdService,
  reviewLoanService,
  approveLoanService,
  rejectLoanService,
        updateLoanApplicationStatusService} from "./loanApplication.service.js";


export const createLoanApplicationController = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const loanApplication = await createLoanApplicationService(req.body, { id: req.user.id, role: req.user.role as any });

    res.status(201).json({
      success: true,
      message: "Loan application created successfully",
      data: loanApplication,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan application creation failed",
    });
  }
};

export const getAllLoanApplicationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const loanApplications = await getAllLoanApplicationsService();
    res.status(200).json({
      success: true,
      message: "Loan applications retrieved successfully",
      data: loanApplications, // return array of loan applications
    });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getLoanApplicationByIdController = async (
  req: Request,
  res: Response
) => {
    try {

const loanApplication = await getLoanApplicationByIdService(req.params.id);
  res.status(200).json({
    success: true,
    message: "Loan application retrieved successfully",
    data: loanApplication, // return loan application data
  });
      } catch {
    res.status(500).json({ success: false });
  }
};
export const updateLoanApplicationStatusController = async (
  req: Request,
  res: Response
) => {
const { id } = req.params;
  const { status } = req.body;
  const updatedLoanApplication = await updateLoanApplicationStatusService(id, { status });
  res.status(200).json({
    success: true,
    message: "Loan application status updated successfully",
    data: updatedLoanApplication, // return updated loan application data
  });
};



export const reviewLoanController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const loan = await reviewLoanService(id);

    res.status(200).json({
      success: true,
      message: "Loan moved to review stage",
      data: loan,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan review failed",
    });
  }
};


export const approveLoanController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const approvedBy = req.user.id;

    const loan = await approveLoanService(id, approvedBy);

    res.status(200).json({
      success: true,
      message: "Loan approved successfully",
      data: loan,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan approval failed",
    });
  }
};


export const rejectLoanController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rejectedBy = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const loan = await rejectLoanService(id, reason, rejectedBy);

    res.status(200).json({
      success: true,
      message: "Loan rejected successfully",
      data: loan,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan rejection failed",
    });
  }
};
