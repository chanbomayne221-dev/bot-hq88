# HQ88 VUA TRÒ CHƠI — Telegram Bot (Production)

Bot Telegram TX/XX/Slot/Basketball/Jackpot, đóng gói sẵn để deploy Railway.

> **Gameplay, lệnh, callback, menu, format tin nhắn, emoji, công thức cược — GIỮ NGUYÊN 100%** so với source gốc (`src/index.ts`).
> Repo này chỉ bổ sung phần *deploy* (Docker, Railway, healthcheck, anti-crash, auto-reconnect, backup SQLite).

---

## 1. Yêu cầu

- Node.js **20+**
- SQLite (đi kèm `better-sqlite3`)
- Token bot từ [@BotFather](https://t.me/BotFather)

## 2. Cấu trúc

```
.
├── src/
│   ├── index.ts            # Source bot gốc (KHÔNG sửa logic)
│   ├── server.ts           # Entry production: healthcheck + anti-crash + auto reconnect
│   └── lib/
│       ├── db.ts           # better-sqlite3 + WAL + path qua DB_PATH
│       ├── logger.ts       # Logger pino-style nhẹ
│       └── bot-instance.ts # set/getBotInstance
├── assets/qr_nap_tien.png  # QR nạp tiền (thay bằng QR thật)
├── scripts/backup-db.sh    # Auto backup SQLite
├── Dockerfile
├── railway.json
├── ecosystem.config.js     # PM2
├── .env.example
└── package.json
```

## 3. Chạy local

```bash
cp .env.example .env
# Điền TELEGRAM_BOT_TOKEN, ADMIN_IDS
npm install
npm run dev          # tsx watch
# hoặc:
npm run build && npm start
```

## 4. Deploy Railway

1. Tạo project Railway → **New Service → Deploy from GitHub repo** (hoặc `railway up`).
2. Railway sẽ tự nhận `Dockerfile` và `railway.json`.
3. Vào **Variables** thêm:
   - `TELEGRAM_BOT_TOKEN`
   - `ADMIN_IDS` (vd: `7776471599,123456789`)
   - `DB_PATH=/app/data/bot.sqlite`
4. **Volumes → New Volume** mount vào `/app/data` để giữ SQLite qua các lần redeploy.
5. Service sẽ expose `/health` cho Railway healthcheck (đã config trong `railway.json`).
6. Restart policy: `ALWAYS`, retry 10 lần — bot tự sống lại khi crash.

### Vì sao bot không "sleep" / không mất DB

- HTTP server `:8080` luôn mở `/health` → Railway không idle service.
- Polling Telegram tự reconnect khi gặp `EFATAL` / `ETELEGRAM`.
- `uncaughtException` và `unhandledRejection` được log thay vì kill process.
- SQLite nằm trên Railway Volume tại `/app/data` (persistent).

## 5. PM2 (VPS thay vì Railway)

```bash
npm install -g pm2
npm run build
pm2 start ecosystem.config.js
pm2 save && pm2 startup
```

## 6. Auto backup SQLite

```bash
# Thủ công
npm run backup

# Cron (mỗi 6h)
0 */6 * * * cd /app && bash scripts/backup-db.sh >> /app/logs/backup.log 2>&1
```

Backup gzip vào `data/backups/`, tự xoá file cũ hơn `BACKUP_KEEP_DAYS` ngày (mặc định 7).

## 7. Bảo trì

- **Reset polling cứng**: restart service trên Railway.
- **Xem log**: Railway → Deployments → Logs (định dạng JSON-ish).
- **Kiểm tra DB**: `sqlite3 /app/data/bot.sqlite ".tables"`.

## 8. Lệnh & gameplay

Toàn bộ commands, callback_data, format message, emoji, tỷ lệ cược, timer game, fake bots, lịch sử phiên, giftcode, checkin, withdraw/deposit, VIP, referral, admin menu — **giữ nguyên** từ `src/index.ts`. Repo này không sửa một dòng gameplay nào.

---

© HQ88 — Production deploy template.
