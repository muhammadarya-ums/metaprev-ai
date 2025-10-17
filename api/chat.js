export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  console.log("✅ Request masuk:", req.method);

  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Message is required" });

  // 🌐 Tentukan BASE_URL yang benar
  const BASE_URL =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.DEPLOYMENT_URL ||
        req.headers.origin ||
        "https://metaprev.vercel.app"; // fallback default

  console.log("🌐 BASE_URL:", BASE_URL);

  // 🔍 Deteksi apakah permintaan berita
  const isNewsRequest = /(berita( terkini| terbaru| terupdate)?( tentang)? (kesehatan|medis|dunia))/i.test(
    message.toLowerCase()
  );

  try {
    const endpoint = isNewsRequest ? "news" : "ai";
    const fullURL = `${BASE_URL}/api/${endpoint}`;
    console.log(`🔁 Meneruskan ke ${fullURL}`);

    const response = await fetch(fullURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { reply: text };
    }

    console.log("✅ Respons dari /api/" + endpoint, data);
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("🔥 Error utama di /api/chat:", error);
    return res.status(500).json({
      reply: "⚠️ Terjadi kesalahan saat memproses permintaan.",
    });
  }
}
