export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Message is required" });

  console.log("🤖 Menghubungi OpenRouter...");
  console.log("🔑 OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "✅ Ada" : "❌ Tidak ada");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://metaprev.vercel.app",
        "X-Title": "Metaprev AI",
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah Metaprev-AI, asisten AI ahli kesehatan masyarakat dan pencegahan penyakit. " +
              "Gunakan bahasa Indonesia yang sopan, mudah dipahami, dan edukatif. Jangan memberi diagnosis pasti, " +
              "tapi beri saran umum dan anjurkan konsultasi ke dokter jika diperlukan.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error("❌ Gagal dari OpenRouter:", text);
      return res.status(500).json({ reply: "⚠️ Gagal menghubungi AI." });
    }

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.message?.content || "⚠️ AI tidak memberikan respons.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("🔥 Error di /api/ai:", error);
    return res.status(500).json({ reply: "⚠️ Terjadi kesalahan saat menghubungi AI." });
  }
}
