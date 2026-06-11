import { useCallback, useEffect, useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import AccessGate from "../components/AccessGate";
import Brand from "../components/Brand";
import { getLeaderData } from "../lib/workshop";

export default function LeaderDashboard() {
  const [code, setCode] = useState(sessionStorage.getItem("leader-code") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (accessCode = code) => {
    if (!accessCode) return;
    try {
      const result = await getLeaderData(accessCode);
      setData(result);
      setCode(accessCode);
      setError("");
      sessionStorage.setItem("leader-code", accessCode);
    } catch {
      setError("That leader access code is not valid.");
    }
  }, [code]);

  useEffect(() => {
    if (code) load();
  }, [code, load]);

  if (!data) {
    return (
      <AccessGate
        label="Group leader dashboard"
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

  return (
    <main className="dashboard shell shell--wide">
      <header className="dashboard-header">
        <Brand />
        <div><p className="eyebrow">{data.group.name}</p><h1>{data.group.leader_name || "Leader"} follow-up</h1></div>
      </header>
      <div className="leader-intro">
        <strong>Follow up within 24 hours.</strong>
        <span>Thank them for joining, affirm their honesty, and offer a next conversation.</span>
      </div>
      <section className="response-grid">
        {data.responses.length ? data.responses.map((response) => (
          <article className="response-card" key={response.id}>
            <div className="response-card__top">
              <div className="avatar">{(response.first_name || "?").slice(0, 1).toUpperCase()}</div>
              <div><h2>{response.first_name || "Anonymous"}</h2><p>{response.spiritual_interest}</p></div>
            </div>
            <div className="tag-list">
              {response.next_steps.map((step) => <span key={step}>{step}</span>)}
            </div>
            {response.prayer_request ? <blockquote><strong>Prayer</strong>{response.prayer_request}</blockquote> : null}
            <div className="contact-list">
              {response.phone ? <a href={`tel:${response.phone}`}><Phone size={16} />{response.phone}</a> : null}
              {response.email ? <a href={`mailto:${response.email}`}><Mail size={16} />{response.email}</a> : null}
              {response.instagram ? <span><MessageCircle size={16} />{response.instagram}</span> : null}
            </div>
            {response.preferred_contact ? <small>Prefers {response.preferred_contact}</small> : null}
          </article>
        )) : <div className="empty">No responses have been assigned to this group yet.</div>}
      </section>
    </main>
  );
}
