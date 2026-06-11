import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import AccessGate from "../components/AccessGate";
import Brand from "../components/Brand";
import { getPollResults } from "../lib/workshop";

export default function Projector() {
  const [code, setCode] = useState(sessionStorage.getItem("projector-code") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState("");
  const attendeeUrl = useMemo(() => `${location.origin}${location.pathname}`, []);

  const load = useCallback(async (accessCode = code) => {
    if (!accessCode) return;
    try {
      const result = await getPollResults(accessCode);
      setData(result);
      setError("");
      sessionStorage.setItem("projector-code", accessCode);
      setCode(accessCode);
    } catch {
      setError("That access code is not valid.");
    }
  }, [code]);

  useEffect(() => {
    QRCode.toDataURL(attendeeUrl, { width: 360, margin: 1, color: { dark: "#173f36", light: "#ffffff" } }).then(setQr);
  }, [attendeeUrl]);

  useEffect(() => {
    if (!code) return undefined;
    load();
    const timer = setInterval(load, 2500);
    return () => clearInterval(timer);
  }, [code, load]);

  if (!data) {
    return (
      <AccessGate
        label="Projector view"
        error={error}
        loading={loading}
        onSubmit={async (nextCode) => {
          setLoading(true);
          await load(nextCode);
          setLoading(false);
        }}
      />
    );
  }

  const max = Math.max(...data.results.map((item) => item.count), 1);
  return (
    <main className="projector">
      <header className="dashboard-header">
        <Brand />
        <div className="live-pill">
          <span /> Live results · {data.total} {data.total === 1 ? "response" : "responses"}
        </div>
      </header>
      <section className="projector__grid">
        <div>
          <p className="eyebrow">Live poll</p>
          <h1>Which statement feels closest to your experience?</h1>
          <div className="chart">
            {data.results.map((item) => (
              <div className="bar" key={item.choice}>
                <div className="bar__label"><span>{item.choice}</span><strong>{item.count}</strong></div>
                <div className="bar__track"><span style={{ width: `${(item.count / max) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <aside className="qr-card">
          {qr ? <img src={qr} alt="QR code for attendee workshop page" /> : null}
          <h2>Join the conversation</h2>
          <p>Scan once. Keep the page open throughout the workshop.</p>
          <small>{attendeeUrl.replace(/^https?:\/\//, "")}</small>
        </aside>
      </section>
    </main>
  );
}
