import {Request, Response} from "express";

import {
    assignLoanService, unassignloanService,
    getAssignedLoansForEmployeeService

 } from "./loanAssignment.service.js";



export const assignLoanController = async (req: Request, res: Response) => {

    try {

        const { loanApplicationId } = req.params;
        const { employeeId, role } = req.body;
 
        const assigned = await assignLoanService(
            loanApplicationId,
            employeeId,
            role,
            req.user!.id
        )

        res.status(200).json({
            success: true,
            message: "Loan assigned successfully",
            data: assigned
        })
        
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

}


export const unassignLoanController = async (req: Request, res: Response) => {
    
    try {
        const { assignmentId } = req.params;

        const unassigned = await unassignloanService(
            assignmentId,
            req.user!.id
        )
        res.status(200).json({
            success: true,
            message: "Loan unassigned successfully",
            data: unassigned
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })


    }
}


export const getMyAssignedLoansController = async (req: Request, res: Response) => {
    try {
        
        const userId = req.user!.id;
        const loans = await getAssignedLoansForEmployeeService(userId);
       

    res.status(200).json({
        success: true,
        message : "Assigned loans fetched successfully",
        data: loans
        
    })
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.message
        })
    }
}
