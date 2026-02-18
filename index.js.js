import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/* ================== 基础配置 ================== */
const BOT_TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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
  "Support - 24Hr Online Service": "https://t.me/nexbitonlineservice"
};

/* ================== 左右两列 ReplyKeyboard ================== */
const buildKeyboard = () => {
  const keys = Object.keys(LINKS);
  const rows = [];

  for (let i = 0; i < keys.length; i += 2) {
    rows.push([
      { text: keys[i] },
      ...(keys[i + 1] ? [{ text: keys[i + 1] }] : [])
    ]);
  }

  return {
    keyboard: rows,
    resize_keyboard: true
  };
};

const KEYBOARD = buildKeyboard();

/* ================== 发送消息（HTML + 可点击链接） ================== */
const sendMessage = async (chat_id, text, reply_markup = null) => {
  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      reply_markup,
      parse_mode: "HTML",
      disable_web_page_preview: false
    })
  });

  const data = await res.json();
  console.log("TG response:", data);
};

/* ================== 路由 ================== */
app.get("/", (_, res) => res.send("Telegram Bot Running"));

app.post("/webhook", async (req, res) => {
  console.log("Incoming update:", JSON.stringify(req.body));

  const msg = req.body.message;
  if (!msg || !msg.text) {
    return res.sendStatus(200);
  }

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  console.log("User text:", JSON.stringify(text));

  /* ===== /start 显示菜单 ===== */
  if (text === "/start") {
    await sendMessage(
      chatId,
      "🎉 <b>Welcome</b> 🎉\n\n👇 Please choose from menu 👇",
      KEYBOARD
    );
    return res.sendStatus(200);
  }

  /* ===== 点击菜单按钮 → 返回可点击链接 ===== */
  if (LINKS[text]) {
    await sendMessage(
      chatId,
      `🔗 <b>${text}</b>\n\n👉 <a href="${LINKS[text]}">点击这里打开</a>`
    );
    return res.sendStatus(200);
  }

  /* ===== 兜底（防止没反应） ===== */
  await sendMessage(
    chatId,
    "⚠️ 未识别的指令，请使用下方菜单 👇",
    KEYBOARD
  );

  res.sendStatus(200);
});

/* ================== 启动 ================== */
app.listen(process.env.PORT || 3000, () => {
  console.log("Bot started");
});
