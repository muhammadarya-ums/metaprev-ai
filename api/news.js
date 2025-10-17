import Parser from "rss-parser";
const parser = new Parser();

export const config = {
  api: { bodyParser: true },
};

async function getGoogleNews(topic) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    topic
  )}+when:7d&hl=id&gl=ID&ceid=ID:id`;

  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, 5).map((item) => ({
      title: item.title,
      link: item.link,
      published: item.pubDate,
    }));
  } catch (err) {
    console.error("❌ Error Google News:", err);
    return [];
  }
}

async function getGdeltNews(topic) {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(
    topic
  )}&mode=ArtList&maxrecords=5&format=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.articles) return [];
    return data.articles.map((a) => ({
      title: a.title,
      link: a.url,
      published: a.seendate?.slice(0, 10),
    }));
  } catch (err) {
    console.error("❌ Error GDELT:", err);
    return [];
  }
}

export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body || {};
  const topic = message || "kesehatan";

  try {
    console.log("📰 Mencari berita dari Google News dan GDELT...");
    let news = await getGoogleNews(topic);
    if (news.length === 0) news = await getGdeltNews(topic);

    const today = new Date().toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (news.length === 0) {
      return res.status(200).json({
        reply: `Tidak ditemukan berita terbaru tentang ${topic} hingga ${today}.`,
      });
    }

    const formatted = news
      .map(
        (n, i) =>
          `${i + 1}. **${n.title}**\n📅 ${n.published}\n🔗 ${n.link}`
      )
      .join("\n\n");

    const reply = `
🩺 **Berita ${topic.toUpperCase()} Terbaru — ${today}**

${formatted}

💡 Data diambil dari *Google News* & *GDELT* (update otomatis harian).
`;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("🔥 Error di /api/news:", error);
    return res
      .status(500)
      .json({ reply: "⚠️ Terjadi kesalahan saat mengambil berita." });
  }
}
