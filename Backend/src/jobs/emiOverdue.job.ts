import cron from "node-cron";
import { processOverdueEmis } from "../modules/Emi/emi.service.js";

export const startEmiOverdueJob = () => {
  // run every 1 minute  ("*/1 * * * *") for testing,
  // change to "5 * * * *" for production (every hour at minute 5)
  cron.schedule("5 * * * *", async () => {
    try {
      const count = await processOverdueEmis();
      console.log(`EMI Overdue Job: Processed ${count} overdue EMIs.`);
    } catch (error) {
      console.error("EMI Overdue Job: Error processing overdue EMIs:", error);
    }
  });
}