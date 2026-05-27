import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cho phép override qua biến môi trường để Railway volume mount
const DB_PATH =
  process.env["DB_PATH"] ||
  path.join(__dirname, "..", "..", "data", "bot.sqlite");

// Đảm bảo thư mục tồn tại
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

// Cấu hình production-safe
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

// Đóng DB an toàn khi shutdown
function safeClose() {
  try {
    db.close();
  } catch {}
}
process.on("exit", safeClose);
process.on("SIGINT", () => { safeClose(); process.exit(0); });
process.on("SIGTERM", () => { safeClose(); process.exit(0); });
