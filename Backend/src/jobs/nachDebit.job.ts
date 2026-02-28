import cron from "node-cron";
import { processNachAutoDebit } from "../modules/nach/nach.processor.service.js";


export const startNachAutoDebitJob = () => {
  // run every day at 2 AM
    cron.schedule("0 2 * * *", async () => {
      try {
        await processNachAutoDebit();
        console.log("NACH auto-debit process completed successfully.");
      } catch (error) {
        console.error("Error during NACH auto-debit process:", error);
      }
    });
};
