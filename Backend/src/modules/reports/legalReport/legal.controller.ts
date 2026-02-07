import {
    Request,
    Response
} from "express";
import {
  approvelLegalReportService,
    createLegalReportService,
  getAllLegalReportsService
} from "./legal.service.js";




export const createLegalReportController = async(
    req: Request,
    res: Response
) => {
    try {
        const { loanId } = req.params;
        const report = await createLegalReportService(
            loanId,
            req.body,
            req.user!.id
        );
        res.status(201).json({
            success: true,
            message: "Legal report created successfully",
            data: report,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create legal report",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};


export const approvelLegalReportController = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const approved = req.user!.id;
        const report = await approvelLegalReportService(
          reportId,
          approved,
        );
        res.json({
            success: true,
            message: "Legal report approved successfully",
            data: report,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to approve legal report",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });


    }
}

export const getAllLegalReportsController = async (req: Request, res: Response) => {
    try {
        const reports = await getAllLegalReportsService({
          page: Number(req.query.page),
          limit: Number(req.query.limit),
          q: req.query.q?.toString(),
        }, {
            id: req.user!.id,
            role: (req.user as any).role,
            branchId: (req.user as any).branchId,
        });

        res.status(200).json({
            success: true,
            message: "Legal reports retrieved successfully",
            data: reports.data,
            meta: reports.meta,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve legal reports",
            error: error.message || "INTERNAL_SERVER_ERROR",

        });

    }
}



