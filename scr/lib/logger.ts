// Logger gọn nhẹ, tương thích pino-style (logger.info({ ... }, "msg"))
type LogObj = Record<string, any>;

function fmt(level: string, args: any[]): string {
  const time = new Date().toISOString();
  let meta: LogObj | undefined;
  let msg = "";
  if (args.length === 1) {
    if (typeof args[0] === "string") msg = args[0];
    else meta = args[0];
  } else if (args.length >= 2) {
    if (typeof args[0] === "object" && args[0] !== null) {
      meta = args[0];
      msg = String(args[1] ?? "");
    } else {
      msg = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
    }
  }
  const metaStr = meta ? " " + JSON.stringify(meta) : "";
  return `[${time}] ${level.toUpperCase()} ${msg}${metaStr}`;
}

export const logger = {
  info: (...args: any[]) => console.log(fmt("info", args)),
  warn: (...args: any[]) => console.warn(fmt("warn", args)),
  error: (...args: any[]) => console.error(fmt("error", args)),
  debug: (...args: any[]) => {
    if (process.env["LOG_LEVEL"] === "debug") console.log(fmt("debug", args));
  },
};
