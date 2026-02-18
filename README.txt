Railway Telegram Bot 部署说明

1. 在 Telegram 使用 @BotFather 创建 Bot，获取 Bot Token

2. 在 Railway 新建 Project
   - Deploy from GitHub 或 Upload ZIP

3. 进入 Railway → Variables，添加环境变量：
   BOT_TOKEN=你的TelegramBotToken
   OWNER_ID=你的Telegram数字ID

4. 保存 Variables，Railway 会自动重新部署

5. 部署完成后，复制 Railway 提供的域名，例如：
   https://your-project.up.railway.app

6. 在浏览器中设置 Telegram Webhook（只执行一次）：
   https://api.telegram.org/bot<你的BotToken>/setWebhook?url=https://your-project.up.railway.app/webhook

7. 浏览器返回 {"ok":true,"result":true} 表示设置成功

8. 打开 Telegram，对 Bot 发送 /start
   如果看到菜单按钮，说明部署完成
