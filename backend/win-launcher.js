const { spawn } = require("child_process");
const axios = require("axios");

const BACKEND_PATH = "my-backend.exe";
const NGROK_PATH = "ngrok";
const NGROK_PORT = 5000;

const BOT_TOKEN = "YOUR_BOT_TOKEN";
const CHAT_ID = "YOUR_CHAT_ID";

async function sendToTelegram(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
    });
    console.log("Sent message to Telegram!");
  } catch (err) {
    console.error("Telegram send error:", err.message);
  }
}

spawn(BACKEND_PATH, [], {
  detached: true,
  stdio: "ignore",
}).unref();

console.log("Backend started...");

const ngrok = spawn(NGROK_PATH, ["http", NGROK_PORT]);

ngrok.stdout.on("data", (data) => {
  const text = data.toString();

  const match = text.match(/https:\/\/[^\s]+/);
  if (match) {
    const publicUrl = match[0];
    console.log("🔥 Ngrok Public URL:", publicUrl);

    sendToTelegram(`Server is Live:\n${publicUrl}`);
  }
});

ngrok.stderr.on("data", (data) => {
  console.error("Ngrok error:", data.toString());
});

ngrok.on("exit", (code) => {
  console.log(`Ngrok exited with code ${code}`);
});
