import "dotenv/config";
import http from "http";
import { logger } from "./lib/logger";
import { startBot } from "./index";
import { getBotInstance } from "./lib/bot-instance";

// ─── Anti-crash: không bao giờ chết do lỗi không bắt ──────────────────────
process.on("uncaughtException", (err) => {
  logger.error({ err: String(err), stack: (err as any)?.stack }, "uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  logger.error({ reason: String(reason) }, "unhandledRejection");
});

// ─── Khởi động bot có retry ───────────────────────────────────────────────
async function bootBot() {
  let attempt = 0;
  while (true) {
    try {
      const bot = startBot();
      if (!bot) {
        logger.warn("startBot() trả về null. Kiểm tra TELEGRAM_BOT_TOKEN.");
        return;
      }
      logger.info("Bot Telegram đã khởi động (long polling).");

      // Tự động khôi phục polling nếu Telegram trả lỗi nặng
      bot.on("polling_error", async (error: any) => {
        const code = error?.code || error?.response?.statusCode;
        if (code === "EFATAL" || code === "ETELEGRAM") {
          try {
            await bot.stopPolling();
            await new Promise((r) => setTimeout(r, 3000));
            await bot.startPolling({ restart: true });
            logger.warn({ code }, "Đã restart polling sau lỗi");
          } catch (e) {
            logger.error({ e: String(e) }, "Restart polling thất bại");
          }
        }
      });
      return;
    } catch (e) {
      attempt++;
      const delay = Math.min(30_000, 2_000 * attempt);
      logger.error({ e: String(e), attempt, delay }, "Khởi động bot thất bại, thử lại...");
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ─── Healthcheck HTTP cho Railway ─────────────────────────────────────────
const PORT = Number(process.env["PORT"] || 8080);
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/" || req.url === "/healthz") {
    const bot = getBotInstance();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", bot: bot ? "running" : "stopped", uptime: process.uptime() }));
    return;
  }
  res.writeHead(404);
  res.end();
});
server.listen(PORT, () => logger.info(`Healthcheck HTTP server lắng nghe :${PORT}`));

// ─── Shutdown an toàn ─────────────────────────────────────────────────────
async function shutdown(sig: string) {
  logger.warn(`Nhận tín hiệu ${sig}, đang shutdown...`);
  try {
    const bot = getBotInstance();
    if (bot) await bot.stopPolling();
  } catch {}
  try { server.close(); } catch {}
  setTimeout(() => process.exit(0), 1500);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

bootBot();
