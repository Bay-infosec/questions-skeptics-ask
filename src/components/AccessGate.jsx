import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import Brand from "./Brand";

export default function AccessGate({ label, onSubmit, error, loading }) {
  const [code, setCode] = useState("");

  return (
    <main className="gate shell">
      <div className="gate__top">
        <Brand />
        <a className="back-link" href="?view=organizer">
          <ArrowLeft size={16} /> Organizer access
        </a>
      </div>
      <section className="panel gate__panel">
        <p className="eyebrow">Private access</p>
        <h1>{label}</h1>
        <p className="muted">Enter the access code provided by the workshop coordinator.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(code);
          }}
        >
          <label className="field">
            <span>Access code</span>
            <input
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter code"
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="button" disabled={loading}>
            {loading ? "Checking..." : "Open dashboard"}
          </button>
        </form>
      </section>
    </main>
  );
}
