import { Request, Response } from "express";

import {
  createTechnicalReportService,
  approveTechnicalReportService,
  getAllTechnicalReportsService,
} from "./technical.service.js";


export const createTechinicalReportController = async ( req: Request, res: Response) => {
    try {
        const { loanId } = req.params;
        const report = await createTechnicalReportService(
            loanId,
            req.body,
            req.user!.id
        );

        res.status(201).json({
            success: true,
            message: "Technical report created successfully",
            data: report,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create technical report",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};


export const approveTeechnicalReportController = async(
    req: Request,
    res: Response
) => {
    try {
        const { reportId } = req.params;

        const report = await approveTechnicalReportService(
            reportId,
            req.user!.id
        )

        res.json({
            success: true,
            message: "Technical report approved successfully",
        })

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to approve technical report",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};


export const getAllTechnicalReportsController = async(
    req: Request,
    res: Response
) => {
    try {
        const reports = await getAllTechnicalReportsService({
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            q: req.query.q?.toString(),
        });
        res.status(200).json({
            success: true,
            message: "Technical reports retrieved successfully",
            data: reports.data,
            meta: reports.meta,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve technical reports",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};