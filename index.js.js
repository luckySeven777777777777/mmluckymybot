import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/* ================== 基础配置 ================== */
const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ID = Number(process.env.OWNER_ID);
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/* ================== 管理员 & 日志 ================== */
let ADMINS = new Set([OWNER_ID]);
let LOGS = [];

/* ================== 菜单按钮 → 链接 ================== */
const LINKS = {
  "Start - Start Now": "https://www.nexbitsafe.com/",
  "Bonus - အခုပဲရယူလိုက်ပါ": "https://example.com/bonus",
  "Deposit - Kbzpay/WaveMoney/Binanceငွေသွင်းမည်": "https://example.com/deposit",
  "Withdrawl - Kbzpay/Wavemoney/Binanceငွေထုတ်မည်": "https://example.com/withdraw",
  "Agent - အခုဆက်သွယ်မည်": "https://t.me/your_agent",
  "2D/3D - အခုကစားမည်": "https://example.com/2d3d",
  "LIVEကြည့်ရှုရန် - Liveပွဲကြည့္မည်": "https://example.com/live",
  "Bet Slot Game - အခုကစားမည်": "https://example.com/slot",
  "Point - အမှတ်ယူမည်": "https://example.com/point",
  "Free Game - Free Gameကစားမည်": "https://example.com/free",
  "Support - 24Hr Online Service": "https://t.me/your_support"
};

/* ================== 左右一排键盘（2列） ================== */
const buildKeyboard = () => {
  const keys = Object.keys(LINKS);
  const rows = [];

  for (let i = 0; i < keys.length; i += 2) {
    rows.push(
      [
        { text: keys[i] },
        ...(keys[i + 1] ? [{ text: keys[i + 1] }] : [])
      ]
    );
  }

  return {
    keyboard: rows,
    resize_keyboard: true
  };
};

const KEYBOARD = buildKeyboard();

/* ================== 工具函数 ================== */
const sendMessage = (chat_id, text, reply_markup = null) =>
  fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text, reply_markup })
  });

const isAdmin = id => ADMINS.has(Number(id));

const addLog = msg => {
  LOGS.push(`[${new Date().toISOString()}] ${msg}`);
  if (LOGS.length > 50) LOGS.shift();
};

/* ================== 路由 ================== */
app.get("/", (_, res) => res.send("Telegram Bot Running"));

app.post("/webhook", async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || "";

  /* ===== /start 一定显示菜单 ===== */
  if (text === "/start") {
    await sendMessage(
      chatId,
      "🎉 Welcome 🎉\n\nအောက်က Menu မှာရွေးပြီးအသုံးပြုနိုင်ပါတယ်။",
      KEYBOARD
    );
    return res.sendStatus(200);
  }

  /* ===== 菜单按钮点击 ===== */
  if (LINKS[text]) {
    await sendMessage(chatId, LINKS[text]);
    return res.sendStatus(200);
  }

  /* ===== 管理员命令 ===== */
  if (text.startsWith("/")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "⛔ Admin only");
      return res.sendStatus(200);
    }

    const [cmd, arg] = text.split(" ");

    switch (cmd) {
      case "/status":
        await sendMessage(chatId, "✅ Bot Online\nAdmins: " + ADMINS.size);
        break;

      case "/restart":
        addLog("Restart requested");
        await sendMessage(chatId, "♻️ Restarting...");
        process.exit(0);

      case "/logs":
        await sendMessage(chatId, LOGS.join("\n") || "No logs");
        break;

      case "/admins":
        await sendMessage(chatId, [...ADMINS].join("\n"));
        break;

      case "/addadmin":
        if (arg) {
          ADMINS.add(Number(arg));
          addLog(`Admin added: ${arg}`);
          await sendMessage(chatId, `✅ Admin added: ${arg}`);
        }
        break;

      case "/deladmin":
        if (arg && Number(arg) !== OWNER_ID) {
          ADMINS.delete(Number(arg));
          addLog(`Admin removed: ${arg}`);
          await sendMessage(chatId, `❌ Admin removed: ${arg}`);
        }
        break;
    }

    return res.sendStatus(200);
  }

  /* ===== 普通文字也显示菜单 ===== */
  await sendMessage(
    chatId,
    "👇 Please choose from menu 👇",
    KEYBOARD
  );

  res.sendStatus(200);
});

/* ================== 启动 ================== */
app.listen(process.env.PORT || 3000, () => {
  console.log("Bot started");
});
