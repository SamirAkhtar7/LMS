import express from "express";
import routes from "./routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { startEmiOverdueJob } from "./jobs/emiOverdue.job.js";
import { runLoanDefaultCron } from "./jobs/jobs.controller.js";
const app = express();

// Start the EMI overdue job scheduler
startEmiOverdueJob();
// Start the Loan Default cron job (you might want to schedule this as well)
runLoanDefaultCron();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://https://d9vxjqxn-5173.inc1.devtunnels.ms/",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if sending cookies
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", routes);

export default app;
