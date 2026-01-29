import express from "express";
import routes from "./routes.js";
import cookieParser from "cookie-parser";
import multer from "multer";
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
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if sending cookies
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", routes);

// Multer / upload error handler (returns JSON instead of HTML)
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File too large" });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    const status = err.statusCode || 500;
    return res
      .status(status)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
  next();
});

export default app;
