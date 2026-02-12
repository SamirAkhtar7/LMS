import cron from "node-cron";
import { checkKycSLA } from "../sla/sla.service.js";
import { checkLoanAssignmentSLA } from "./assignment.sla.js";
import { checkRecoverySLA } from "./recovery.sla.js";

export const startSlaScheduler = () => {
  // run every 1 minute  ("*/1 * * * *") for testing,
    // change to "0 */6 * * *" for production (every 6 hours)
    //TODO  move to environment variable and make it configurable
    cron.schedule("0 */6 * * *", async () => {
      try{
    console.log("Running SLA checks...");
    await checkKycSLA();
    await checkLoanAssignmentSLA();
    await checkRecoverySLA();
        }
        catch(error){
            console.error("Error running SLA checks:", error);
        }
    });
}