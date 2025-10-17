export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>✅ Metaprev AI</h1>
      <p>Server berjalan dengan baik.</p>
      <p>Coba endpoint API kamu:</p>
      <ul>
        <li><a href="/api/chat">/api/chat</a></li>
        <li><a href="/api/news">/api/news</a></li>
        <li><a href="/api/ai">/api/ai</a></li>
      </ul>
    </main>
  );
}
