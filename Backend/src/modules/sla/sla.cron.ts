import cron from "node-cron";
import { checkKycSLA } from "../sla/sla.service.js";
import { checkLoanAssignmentSLA } from "./assignment.sla.js";
import { checkRecoverySLA } from "./recovery.sla.js";

export const startSlaScheduler = () => {
// run every 1 minute for testing, change to "0 */6 * * *" for production (every 6 hours)
    cron.schedule("0 */6 * * *", async () => {
      console.log("Running SLA checks...");
      await checkKycSLA();
      await checkLoanAssignmentSLA();
      await checkRecoverySLA();
    });
}