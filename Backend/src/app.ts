import express from "express";
import routes from "./routes.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import cors from "cors";
import path from "path";
import { startEmiOverdueJob } from "./jobs/emiOverdue.job.js";
import { runLoanDefaultCron } from "./jobs/jobs.controller.js";
import { startSlaScheduler } from "./modules/sla/sla.cron.js";
import { startNachAutoDebitJob } from "./jobs/nachDebit.job.js";
const app = express();

async function  bootstrap() {
  try {
    await startEmiOverdueJob();
    await runLoanDefaultCron();
    await startSlaScheduler();
    await startNachAutoDebitJob();
  } catch (err) {
    console.error("Critical job startup failure:", err);
    process.exit(1);
  }
}
bootstrap();

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

// ✅ Add static file serving for uploads
app.use("/public", express.static(path.join(process.cwd(), "public")));

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
