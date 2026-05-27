#!/usr/bin/env node
// Backup loop chạy trong cùng process (gọi từ cron ngoài hoặc setInterval)
import { execFileSync } from "child_process";
import path from "path";

const script = path.join(process.cwd(), "scripts", "backup-db.sh");
const intervalH = Number(process.env.BACKUP_INTERVAL_HOURS || 6);

function runBackup() {
  try {
    execFileSync("bash", [script], { stdio: "inherit" });
  } catch (e) {
    console.error("Backup error:", e);
  }
}

runBackup();
setInterval(runBackup, intervalH * 3600 * 1000);
