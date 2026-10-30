export default function NotFound() {
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: "var(--navy)", color: "var(--cream)", textAlign: "center", padding: 24 }}>
      <div>
        <p className="eyebrow" style={{ color: "var(--accent)" }}>404</p>
        <h1 className="h-l" style={{ margin: "16px 0 20px" }}>That page isn't on the schedule.</h1>
        <a href="/" className="btn btn-accent">Back home</a>
      </div>
    </main>
  );
}
