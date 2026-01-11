import cron from "node-cron";
import { processOverdueEmis } from "../modules/Emi/emi.service.js";

export const startEmiOverdueJob = () => {
    cron.schedule("5 * * * *", async () => {
        try {
            const count = await processOverdueEmis();
            console.log(`EMI Overdue Job: Processed ${count} overdue EMIs.`);
        } catch (error) {
            console.error("EMI Overdue Job: Error processing overdue EMIs:", error);
        }
    });
}