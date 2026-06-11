import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, MessageCircleQuestion, Users } from "lucide-react";
import AccessGate from "../components/AccessGate";
import Brand from "../components/Brand";
import { getModeratorData, updateQuestionStatus } from "../lib/workshop";

export default function ModeratorDashboard() {
  const [code, setCode] = useState(sessionStorage.getItem("moderator-code") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (accessCode = code) => {
    if (!accessCode) return;
    try {
      const result = await getModeratorData(accessCode);
      setData(result);
      setCode(accessCode);
      setError("");
      sessionStorage.setItem("moderator-code", accessCode);
    } catch {
      setError("That access code is not valid.");
    }
  }, [code]);

  useEffect(() => {
    if (!code) return undefined;
    load();
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [code, load]);

  if (!data) {
    return (
      <AccessGate
        label="Moderator dashboard"
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

  async function setStatus(id, status) {
    await updateQuestionStatus(code, id, status);
    await load();
  }

  return (
    <main className="dashboard shell shell--wide">
      <header className="dashboard-header">
        <Brand />
        <div><p className="eyebrow">Workshop control</p><h1>Moderator dashboard</h1></div>
      </header>
      <section className="stats">
        <article><Users /><strong>{data.metrics.poll_responses}</strong><span>Poll responses</span></article>
        <article><MessageCircleQuestion /><strong>{data.metrics.questions}</strong><span>Questions</span></article>
        <article><Clock3 /><strong>{data.metrics.followups}</strong><span>Next-step forms</span></article>
        <article><Check /><strong>{data.metrics.contact_requests}</strong><span>Contact requests</span></article>
      </section>
      <section className="dashboard-grid">
        <div>
          <div className="section-heading"><div><p className="eyebrow">Anonymous</p><h2>Questions to discuss</h2></div></div>
          <div className="question-list">
            {data.questions.length ? data.questions.map((item) => (
              <article className={`question-card question-card--${item.status}`} key={item.id}>
                <div><span>{item.status}</span><time>{new Date(item.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time></div>
                <p>{item.question}</p>
                <div className="question-actions">
                  <button onClick={() => setStatus(item.id, "featured")}>Feature</button>
                  <button onClick={() => setStatus(item.id, "answered")}>Answered</button>
                  <button onClick={() => setStatus(item.id, "new")}>Reset</button>
                </div>
              </article>
            )) : <div className="empty">Questions will appear here as they arrive.</div>}
          </div>
        </div>
        <aside>
          <div className="section-heading"><div><p className="eyebrow">Movement</p><h2>Next steps</h2></div></div>
          <div className="metric-list">
            {data.next_steps.map((item) => (
              <div key={item.label}><span>{item.label}</span><strong>{item.count}</strong></div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
