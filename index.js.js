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
    body: JSON.stringify({
      chat_id,
      text,
      reply_markup,
      disable_web_page_preview: false
    })
  });

const isAdmin = id => ADMINS.has(Number(id));

/* ================== 路由 ================== */
app.get("/", (_, res) => res.send("Telegram Bot Running"));

app.post("/webhook", async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text || "";

  /* ===== /start 显示菜单 ===== */
  if (text === "/start") {
    await sendMessage(
      chatId,
      "🎉 Welcome 🎉\n\n👇 Please choose from menu 👇",
      KEYBOARD
    );
    return res.sendStatus(200);
  }

  /* ===== 菜单按钮点击 → 显示可点击链接 ===== */
  if (LINKS[text]) {
    await sendMessage(
      chatId,
      `🔗 ${text}\n\n👉 点击打开：\n${LINKS[text]}`
    );
    return res.sendStatus(200);
  }

  /* ===== 管理员命令 ===== */
  if (text.startsWith("/")) {
    if (!isAdmin(userId)) {
      await sendMessage(chatId, "⛔ Admin only");
      return res.sendStatus(200);
    }

    if (text === "/status") {
      await sendMessage(chatId, "✅ Bot Online");
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
