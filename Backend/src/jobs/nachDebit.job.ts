import cron from "node-cron";
import { processNachAutoDebit } from "../modules/nach/nach.processor.service.js";


export const startNachAutoDebitJob = () => {
  // run every min for testing, change to "0 2 * * *" for production (every day at 2 AM) 
    cron.schedule("*/1 * * * *", async () => {
      try {
        await processNachAutoDebit();
        console.log("NACH auto-debit process completed successfully.");
      } catch (error) {
        console.error("Error during NACH auto-debit process:", error);
      }
    });
};
