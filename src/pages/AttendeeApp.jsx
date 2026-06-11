import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  MessageCircleQuestion,
  Send,
  Sparkles,
} from "lucide-react";
import Brand from "../components/Brand";
import Choice from "../components/Choice";
import {
  getPublicWorkshop,
  submitFollowup,
  submitPoll,
  submitQuestion,
} from "../lib/workshop";
import { validateFollowup } from "../lib/validation";

const pollOptions = [
  "I often worry about my future.",
  "I feel pressure to succeed.",
  "I sometimes feel alone even around people.",
  "I am still figuring out who I am.",
  "I wonder what my purpose is.",
  "I feel like something is missing.",
  "Other",
];

const nextStepOptions = [
  "I trusted Christ tonight.",
  "I want to explore Christianity.",
  "I'd like someone to contact me.",
  "I'd like prayer.",
  "I'd like to read the Bible with someone.",
  "I'd like to join Explore Jesus.",
  "I still have questions.",
  "I'm not ready yet.",
];

const spiritualOptions = [
  "I am already a Christian.",
  "I am curious about Christianity.",
  "I am exploring Jesus.",
  "I think I am ready to follow Jesus.",
  "I'm unsure.",
];

const initialFollowup = {
  nextSteps: [],
  firstName: "",
  phone: "",
  instagram: "",
  email: "",
  preferredContact: "",
  groupId: "",
  spiritualInterest: "",
  prayerRequest: "",
};

function attendeeId() {
  const stored = localStorage.getItem("workshop-attendee-id");
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem("workshop-attendee-id", id);
  return id;
}

export default function AttendeeApp() {
  const [workshop, setWorkshop] = useState(null);
  const [step, setStep] = useState(0);
  const [pollChoice, setPollChoice] = useState("");
  const [question, setQuestion] = useState("");
  const [questionSent, setQuestionSent] = useState(false);
  const [followup, setFollowup] = useState(initialFollowup);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const id = useMemo(attendeeId, []);

  useEffect(() => {
    getPublicWorkshop().then(setWorkshop).catch(() => setMessage("This workshop is not available yet."));
  }, []);

  async function savePoll() {
    if (!pollChoice) return setErrors({ poll: "Choose one response." });
    setBusy(true);
    try {
      await submitPoll(pollChoice, id);
      setErrors({});
      setStep(2);
    } catch {
      setMessage("We couldn't save your response. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveQuestion() {
    if (!question.trim()) return;
    setBusy(true);
    try {
      await submitQuestion(question.trim(), id);
      setQuestion("");
      setQuestionSent(true);
    } catch {
      setMessage("We couldn't send your question. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveFollowup() {
    const nextErrors = validateFollowup(followup);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      await submitFollowup(followup, id);
      setStep(4);
    } catch {
      setMessage("We couldn't save your next step. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!workshop) {
    return (
      <main className="loading">
        <Brand />
        <div className="loading__line" />
        {message ? <p>{message}</p> : null}
      </main>
    );
  }

  return (
    <main className="attendee">
      <header className="mobile-header">
        <Brand compact />
        <span className="step-count">{Math.min(step + 1, 4)} / 4</span>
      </header>

      <div className="progress">
        <span style={{ width: `${Math.min(((step + 1) / 4) * 100, 100)}%` }} />
      </div>

      <section className="mobile-content">
        {step === 0 ? (
          <div className="hero">
            <div className="hero__orb"><Sparkles size={28} /></div>
            <p className="eyebrow">Identity · Meaning · Hope</p>
            <h1>Honest questions are welcome here.</h1>
            <p className="lead">
              Thanks for joining us. Participate openly, respectfully, and anonymously if you prefer.
            </p>
            <div className="privacy-note">
              <HelpCircle size={20} />
              <span>Your poll and questions do not ask for your name.</span>
            </div>
            <button className="button button--large" onClick={() => setStep(1)}>
              Start poll <ArrowRight size={19} />
            </button>
            <a className="organizer-link" href="?view=organizer">
              Workshop team access <ArrowRight size={15} />
            </a>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <p className="eyebrow">Live poll</p>
            <h1>Which statement feels closest to your experience?</h1>
            <p className="muted">Choose one. Results will appear on the room screen, not your phone.</p>
            <div className="choice-list">
              {pollOptions.map((option) => (
                <Choice
                  key={option}
                  checked={pollChoice === option}
                  onChange={() => setPollChoice(option)}
                >
                  {option}
                </Choice>
              ))}
            </div>
            {errors.poll ? <p className="error">{errors.poll}</p> : null}
            <button className="button" onClick={savePoll} disabled={busy}>
              {busy ? "Submitting..." : "Submit response"} <ArrowRight size={18} />
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <p className="eyebrow">Anonymous question box</p>
            <h1>What would you most like answered about Christianity?</h1>
            <p className="muted">Optional. You can return and send another question anytime.</p>
            <label className="field">
              <span>Your question</span>
              <textarea
                rows="5"
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  setQuestionSent(false);
                }}
                placeholder="Why does God allow suffering?"
              />
            </label>
            <div className="prompt-list">
              <span>How do I know Christianity is true?</span>
              <span>What happens after death?</span>
              <span>Why are there so many religions?</span>
            </div>
            {questionSent ? <p className="success"><Check size={17} /> Your question was sent anonymously.</p> : null}
            <button
              className="button"
              onClick={saveQuestion}
              disabled={busy || !question.trim()}
            >
              <Send size={18} /> {busy ? "Sending..." : "Send anonymously"}
            </button>
            <button className="text-button" onClick={() => setStep(3)}>
              Continue to next steps <ArrowRight size={17} />
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <p className="eyebrow">End of workshop</p>
            <h1>My next step</h1>
            <p className="muted">Check all that apply. Contact details are optional unless you request follow-up.</p>

            <h2>What would you like to do next?</h2>
            <div className="choice-list">
              {nextStepOptions.map((option) => (
                <Choice
                  key={option}
                  multiple
                  checked={followup.nextSteps.includes(option)}
                  onChange={() =>
                    setFollowup((current) => ({
                      ...current,
                      nextSteps: current.nextSteps.includes(option)
                        ? current.nextSteps.filter((item) => item !== option)
                        : [...current.nextSteps, option],
                    }))
                  }
                >
                  {option}
                </Choice>
              ))}
            </div>

            <h2>Where are you today?</h2>
            <div className="choice-list">
              {spiritualOptions.map((option) => (
                <Choice
                  key={option}
                  checked={followup.spiritualInterest === option}
                  onChange={() => setFollowup((current) => ({ ...current, spiritualInterest: option }))}
                >
                  {option}
                </Choice>
              ))}
            </div>
            {errors.spiritualInterest ? <p className="error">{errors.spiritualInterest}</p> : null}

            <h2>Conversation group</h2>
            <label className="field">
              <span>Select your group leader</span>
              <select
                value={followup.groupId}
                onChange={(event) => setFollowup((current) => ({ ...current, groupId: event.target.value }))}
              >
                <option value="">Choose a group (optional)</option>
                {workshop.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}{group.leader_name ? ` · ${group.leader_name}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <h2>Contact information</h2>
            <div className="field-grid">
              {[
                ["firstName", "First name", "Your name"],
                ["phone", "Phone number", "(555) 123-4567"],
                ["instagram", "Instagram", "@username"],
                ["email", "Email", "you@example.com"],
              ].map(([key, label, placeholder]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <input
                    value={followup[key]}
                    onChange={(event) => setFollowup((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={placeholder}
                    type={key === "email" ? "email" : "text"}
                  />
                </label>
              ))}
            </div>
            <label className="field">
              <span>Preferred contact method</span>
              <select
                value={followup.preferredContact}
                onChange={(event) => setFollowup((current) => ({ ...current, preferredContact: event.target.value }))}
              >
                <option value="">Choose one (optional)</option>
                <option>Text</option>
                <option>Instagram DM</option>
                <option>Email</option>
                <option>Phone Call</option>
              </select>
            </label>
            {errors.contact ? <p className="error">{errors.contact}</p> : null}

            <h2>Prayer request</h2>
            <label className="field">
              <span>Is there anything we can pray for?</span>
              <textarea
                rows="4"
                value={followup.prayerRequest}
                onChange={(event) => setFollowup((current) => ({ ...current, prayerRequest: event.target.value }))}
                placeholder="Optional"
              />
            </label>

            <button className="button button--large" onClick={saveFollowup} disabled={busy}>
              {busy ? "Saving..." : "Submit my next step"} <ArrowRight size={19} />
            </button>
            <button className="text-button" onClick={() => setStep(2)}>
              <ArrowLeft size={17} /> Back to question box
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="hero hero--complete">
            <div className="hero__orb"><Check size={30} /></div>
            <p className="eyebrow">Thank you</p>
            <h1>Your response is in.</h1>
            <p className="lead">
              Thanks for sharing honestly. A leader will follow up if you requested contact.
            </p>
            <button className="button button--secondary" onClick={() => setStep(2)}>
              <MessageCircleQuestion size={18} /> Ask another anonymous question
            </button>
          </div>
        ) : null}
        {message && step > 0 ? <p className="toast">{message}</p> : null}
      </section>
    </main>
  );
}
