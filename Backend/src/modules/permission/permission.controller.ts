
import {
    assignPermissionsService,
    createPermissionsService,
    getUserPermissionsService,
} from "./permission.service.js";
import e, { Response, Request } from "express";
export const assignPermissionsController = async (req: Request, res: Response) => {
    try {
        const { userId, permissions } = req.body;

        if(!userId || !permissions){
            return  res.status(400).json({
                success: false,
                message: "userId and permissions are required",
            });
        }
        if(!Array.isArray(permissions)){
            return res.status(400).json({
                success: false,
                message: "permissions must be an array of permission codes",
            });
        }
        await assignPermissionsService(userId, permissions);
        res.status(200).json({
            success: true,
            message: "Permissions assigned successfully",
        });


    }
    catch (error: any) {
        if (error.message && error.message.includes("not found")) {
            return res.status(404).json({ success: false, message: error.message });
        }   

        res.status(500).json({
            success: false,
            message: "Failed to assign permissions",
            error:  "INTERNAL_SERVER_ERROR",
        });
    }
};


export const createPermissionsController = async (req: Request, res: Response) => {

    try {
        const { code, name } = req.body;
        
        const permission = await createPermissionsService({ code, name });  
        res.status(201).json({
            success: true,
            message: "Permission created successfully",
            data: permission,
        });

    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create permission",
            error:  error.message || "INTERNAL_SERVER_ERROR",
        });
    }
}

export const getUserPermissionsController = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const permissions = await getUserPermissionsService(userId);
        res.status(200).json({ success: true, data: permissions });
    } catch (error: any) {
        if (error?.message && error.message.includes("not found")) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message || "Failed to fetch user permissions" });
    }
};
        
