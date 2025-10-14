import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // pastikan sudah install ini

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": Bearer ${process.env.OPENROUTER_API_KEY},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free", // model gratis di OpenRouter
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠ AI tidak memberikan respons.";
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.json({ reply: "⚠ Terjadi kesalahan saat menghubungi AI." });
  }
});

app.listen(3000, () => console.log("🤖 Server chatbot aktif di http://localhost:3000"));