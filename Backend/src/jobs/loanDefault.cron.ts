import cron from "node-cron";
import { checkAndMarkLoanDefault } from "../modules/loanDefault/loanDefault.service.js";
import { prisma } from "../db/prismaService.js";
export const startLoanDefaultJob = () => {
    cron.schedule("10 * * * *", async () => {
        try {

            const activeLoans = await prisma.loanApplication.findMany({
              where: {
                status: {
                  in: ["active", "delinquent"],
                },
              },
              select: { id: true },
            });
            
            for (const loan of activeLoans) {
                try{
                    await checkAndMarkLoanDefault(loan.id);
                } catch (error) {
                    console.error(`Error processing loan ${loan.id}:`, error);
                }
            }

            console.log("Loan Default Job: Completed checking and marking loan defaults.");
        } catch (error) {
            console.error("Loan Default Job: Error checking and marking loan defaults:", error);
        }
    });
}
