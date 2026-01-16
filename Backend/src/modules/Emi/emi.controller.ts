import { Request, Response } from "express";
import { prisma } from "../../db/prismaService.js";
import { generateEmiSchedule } from "../../common/utils/emi.util.js";
import {
  getEmiAmountService,
  getLoanEmiService,
  generateEmiScheduleService,
  markEmiPaidService,
  getThisMonthEmiAmountService,
  payforecloseLoanService,
  applyMoratoriumService,
} from "./emi.service.js";
import {
  processOverdueEmis,
  payEmiService,
  forecloseLoanService,
} from "./emi.service.js";
import app from "../../app.js";
import { en } from "zod/locales";

export const generateEmiScheduleController = async (
  req: Request,
  res: Response
) => {
  try {
    const loanId = req.params.id;
    const schedule = await generateEmiScheduleService(loanId);
    res.status(200).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to generate EMI schedule",
      error: error.message,
    });
  }
};

export const getThisMonthEmiAmountController = async (
  req: Request,
  res: Response
) => {
  try {
    const loanApplicationId = req.params.loanApplicationId;

    const result = await getThisMonthEmiAmountService(loanApplicationId);

    res.status(200).json({
      success: true,
      message: "This month EMI amount fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLoanEmiController = async (req: Request, res: Response) => {
  try {
    const loanId = req.params.id;
    const emis = await getLoanEmiService(loanId);
    res.status(200).json({
      success: true,
      data: emis,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch EMI schedule",
      error: error.message,
    });
  }
};

export const markEmiPaidController = async (req: Request, res: Response) => {
  try {
    const { amountPaid, paymentMode, isBounce } = req.body;
    const emiId = req.params.emiId;

    const emi = await markEmiPaidService({
      emiId,
      amountPaid,
      paymentMode,
      isBounce,
    });

    res.status(200).json({ success: true, data: emi });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const genrateEmiAmount = async (req: Request, res: Response) => {
  try {
    const { principal, annualInterestRate, tenureMonths, interestType } =
      req.body;
    const { emiAmount, totalPayable } = await getEmiAmountService({
      principal,
      annualInterestRate,
      tenureMonths,
      interestType,
    });
    res.status(200).json({ success: true, data: { emiAmount, totalPayable } });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate EMI amount",
      error: error.message,
    });
  }
};

// export const processOverdueEmisController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const processedCount = await processOverdueEmis();

//     return res.status(200).json({
//       success: true,
//       message:
//         processedCount === 0
//           ? "No overdue EMIs to process"
//           : `${processedCount} EMI(s) marked as overdue`,
//       data: {
//         processedCount,
//       },
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to process overdue EMIs",
//       error: error.message,
//     });
//   }
// };

export const payEmiServiceController = async (req: Request, res: Response) => {
  try {
    const emiId = req.params.emiId;
    const { amount, paymentMode } = req.body;
    const emi = await payEmiService(emiId, amount, paymentMode);

    res.status(200).json({ success: true, data: emi });
  } catch (error: any) {

    if (error.message === "EMI already paid") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Insufficient payment amount") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if(error.message === "EMI not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Loan is not active") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
      
    }
      res.status(500).json({
        success: false,
        message: "Failed to pay EMI",
        error: error.message,
      });
  }
};

export const forecloseLoanController = async (req: Request, res: Response) => {
  try {
    const loanId = req.params.loanId;
    // Implement foreclose loan logic here
    const result = await forecloseLoanService(loanId);
    res.status(200).json({
      success: true,
      message: "Loan foreclosed successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to foreclose loan",
      error: error.message,
    });
  }
};

export const payforecloseLoanController = async (req: Request, res: Response) => {
  
  try {
    const loanId = req.params.loanId;
    const data = req.body;
    // Implement foreclose loan logic here
    const result = await payforecloseLoanService(loanId, data);
    res.status(200).json({
      success: true,
      message: "Loan foreclosed successfully",
      data: result,
    });
  }
  catch (error: any) {
    if (error.message === "Insufficient payment amount to foreclose the loan") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if(error.message === "Payment amount must be greater than zero") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message === "Loan not found or already foreclosed") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if(error.message === "At least 6 EMIs must be paid before foreclosing the loan") {
      return res.status(400).json({
        success: false,
        message: error.message,
      
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to foreclose loan",
      error: error.message,
    });
  }
}

export const applyMorationtoriumController = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { type, startDate, endDate } = req.body;
    
    if (!loanId || !type || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const result = await applyMoratoriumService({loanId, type, startDate: new Date(startDate), endDate: new Date(endDate)});
    res.status(200).json({
      success: true,
      message: "Moratorium applied successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to apply moratorium",
      error: error.message,
    });
  }
}