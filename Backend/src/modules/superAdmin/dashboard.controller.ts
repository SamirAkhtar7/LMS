import {
    Request,
    Response,
} from "express";
import { getSuperAdminDashboardService } from "./dashboard.service.js";
  
export const getSuperAdminDashboardController = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== "SUPER_ADMIN") {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const dashboardData = await getSuperAdminDashboardService();
        res.status(200).json({
            success: true,
            message: "Dashboard data retrieved successfully",
            data: dashboardData,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard data",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};